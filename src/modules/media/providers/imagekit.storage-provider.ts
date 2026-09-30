import { Logger } from "@nestjs/common";
import ImageKit, { toFile } from "@imagekit/nodejs";

import type { ObjectStorageProvider, SignedGetUrlOptions } from "../storage.types";

/**
 * Local-development object storage via ImageKit.
 *
 * Private resumes are uploaded with `isPrivateFile: true` and accessed only
 * through short-lived signed URLs (`helper.buildSrc`). The DB stores the stable
 * file path/key — never a temporary or permanent public URL.
 *
 * Uses the official `@imagekit/nodejs` SDK:
 * https://github.com/imagekit-developer/imagekit-nodejs
 */
export class ImageKitStorageProvider implements ObjectStorageProvider {
  readonly name = "imagekit" as const;
  private readonly logger = new Logger(ImageKitStorageProvider.name);
  private readonly publicKey: string | null;
  private readonly privateKey: string | null;
  private readonly urlEndpoint: string | null;
  private client: ImageKit | null = null;

  constructor() {
    this.publicKey = process.env.IMAGEKIT_PUBLIC_KEY || null;
    this.privateKey = process.env.IMAGEKIT_PRIVATE_KEY || null;
    this.urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || null;
  }

  isConfigured(): boolean {
    return Boolean(this.publicKey && this.privateKey && this.urlEndpoint);
  }

  missingEnvVars(): string[] {
    const missing: string[] = [];
    if (!this.publicKey) missing.push("IMAGEKIT_PUBLIC_KEY");
    if (!this.privateKey) missing.push("IMAGEKIT_PRIVATE_KEY");
    if (!this.urlEndpoint) missing.push("IMAGEKIT_URL_ENDPOINT");
    return missing;
  }

  private ik(): ImageKit {
    if (!this.privateKey || !this.urlEndpoint) {
      throw new Error("Object storage is not configured.");
    }
    if (!this.client) {
      this.client = new ImageKit({ privateKey: this.privateKey });
    }
    return this.client;
  }

  private assertConfigured(): void {
    if (!this.isConfigured()) {
      throw new Error("Object storage is not configured.");
    }
  }

  /** Normalize to ImageKit path form (`/folder/file.ext`). */
  private toFilePath(key: string): string {
    return key.startsWith("/") ? key : `/${key}`;
  }

  private splitKey(key: string): { folder: string; fileName: string } {
    const filePath = this.toFilePath(key);
    const idx = filePath.lastIndexOf("/");
    const fileName = idx >= 0 ? filePath.slice(idx + 1) : filePath;
    const folder = idx > 0 ? filePath.slice(0, idx) : "/";
    return { folder, fileName };
  }

  async put(key: string, body: Buffer, contentType: string): Promise<{ url: string }> {
    this.assertConfigured();
    const { folder, fileName } = this.splitKey(key);
    await this.ik().files.upload({
      file: await toFile(body, fileName, { type: contentType }),
      fileName,
      folder,
      useUniqueFileName: false,
      overwriteFile: true,
      isPrivateFile: false,
    });
    return { url: this.publicUrl(key) };
  }

  async putPrivate(key: string, body: Buffer, contentType: string): Promise<void> {
    this.assertConfigured();
    const { folder, fileName } = this.splitKey(key);
    await this.ik().files.upload({
      file: await toFile(body, fileName, { type: contentType }),
      fileName,
      folder,
      useUniqueFileName: false,
      overwriteFile: true,
      isPrivateFile: true,
      responseFields: ["isPrivateFile"],
    });
  }

  async getSignedGetUrl(key: string, options?: SignedGetUrlOptions): Promise<string> {
    this.assertConfigured();
    const expiresIn = options?.expiresInSeconds ?? 5 * 60;
    return this.ik().helper.buildSrc({
      urlEndpoint: this.urlEndpoint!,
      src: this.toFilePath(key),
      signed: true,
      expiresIn,
      ...(options?.downloadFileName
        ? { queryParameters: { "ik-attachment": "true" } }
        : {}),
    });
  }

  async remove(key: string): Promise<void> {
    if (!this.isConfigured()) return;
    try {
      const filePath = this.toFilePath(key);
      const { folder, fileName } = this.splitKey(key);
      // ImageKit delete requires fileId; resolve it via DAM list/search.
      const assets = await this.ik().assets.list({
        searchQuery: `name:"${fileName.replace(/"/g, "")}" AND path:"${folder}"`,
        limit: 5,
      });
      const match = assets.find(
        (asset) =>
          "fileId" in asset &&
          typeof asset.fileId === "string" &&
          ("filePath" in asset ? asset.filePath === filePath : true),
      );
      if (!match || !("fileId" in match) || typeof match.fileId !== "string") {
        this.logger.warn(`ImageKit file not found for delete: ${filePath}`);
        return;
      }
      await this.ik().files.delete(match.fileId);
    } catch (err) {
      this.logger.error(`Failed to delete orphaned object ${key}`, err as Error);
    }
  }

  publicUrl(key: string): string {
    if (!this.urlEndpoint) throw new Error("Object storage is not configured.");
    const base = this.urlEndpoint.replace(/\/+$/, "");
    return `${base}${this.toFilePath(key)}`;
  }
}

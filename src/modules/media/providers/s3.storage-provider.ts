import { Logger } from "@nestjs/common";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import type { ObjectStorageProvider, SignedGetUrlOptions } from "../storage.types";

/**
 * Production private/public object storage via AWS S3.
 *
 * Credentials come from the SDK default provider chain (Lambda/EC2 IAM role).
 * Never read AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY from env here.
 */
export class S3StorageProvider implements ObjectStorageProvider {
  readonly name = "s3" as const;
  private readonly logger = new Logger(S3StorageProvider.name);
  private readonly region: string;
  private readonly bucket: string | null;
  private readonly publicBase: string | null;
  private client: S3Client | null = null;

  constructor() {
    this.region = process.env.AWS_REGION ?? "ap-south-1";
    this.bucket =
      process.env.AWS_S3_BUCKET ||
      process.env.AWS_S3_PROD_BUCKET ||
      process.env.S3_BUCKET ||
      process.env.AWS_BUCKET_NAME ||
      null;
    this.publicBase = process.env.AWS_S3_PUBLIC_URL || null;
  }

  isConfigured(): boolean {
    return Boolean(this.bucket);
  }

  missingEnvVars(): string[] {
    return this.isConfigured() ? [] : ["AWS_S3_BUCKET (or AWS_S3_PROD_BUCKET / S3_BUCKET)"];
  }

  private s3(): S3Client {
    if (!this.client) this.client = new S3Client({ region: this.region });
    return this.client;
  }

  async put(key: string, body: Buffer, contentType: string): Promise<{ url: string }> {
    if (!this.bucket) throw new Error("Object storage is not configured.");
    await this.s3().send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return { url: this.publicUrl(key) };
  }

  async putPrivate(key: string, body: Buffer, contentType: string): Promise<void> {
    if (!this.bucket) throw new Error("Object storage is not configured.");
    await this.s3().send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "private, no-cache",
      }),
    );
  }

  async getSignedGetUrl(key: string, options?: SignedGetUrlOptions): Promise<string> {
    if (!this.bucket) throw new Error("Object storage is not configured.");
    const expiresIn = options?.expiresInSeconds ?? 5 * 60;
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ...(options?.downloadFileName
        ? {
            ResponseContentDisposition: `attachment; filename="${options.downloadFileName.replace(/"/g, "")}"`,
          }
        : {}),
    });
    return getSignedUrl(this.s3(), command, { expiresIn });
  }

  async remove(key: string): Promise<void> {
    if (!this.bucket) return;
    try {
      await this.s3().send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (err) {
      this.logger.error(`Failed to delete orphaned object ${key}`, err as Error);
    }
  }

  publicUrl(key: string): string {
    const base =
      this.publicBase ?? `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
    return `${base.replace(/\/+$/, "")}/${key}`;
  }
}

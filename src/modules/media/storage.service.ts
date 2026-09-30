import { Injectable, Logger } from "@nestjs/common";

import { ImageKitStorageProvider } from "./providers/imagekit.storage-provider";
import { S3StorageProvider } from "./providers/s3.storage-provider";
import {
  type ObjectStorageProvider,
  type SignedGetUrlOptions,
  resolveStorageProviderName,
} from "./storage.types";

/**
 * Object storage facade — CMS media and private resumes.
 *
 * Provider is selected by `STORAGE_PROVIDER`:
 *   - `s3` (default / production): private S3 via IAM role credentials
 *   - `imagekit` (local): ImageKit private files + signed URLs
 *
 * The rest of the media/careers modules never import AWS or ImageKit SDKs.
 * When the active provider is not configured, `isConfigured` reports the state
 * and upload routes return a 400 naming the missing variable rather than a 500.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly provider: ObjectStorageProvider;

  constructor() {
    const name = resolveStorageProviderName();
    this.provider =
      name === "imagekit" ? new ImageKitStorageProvider() : new S3StorageProvider();
    this.logger.log(`Object storage provider: ${this.provider.name}`);
  }

  /** Active provider name (`s3` | `imagekit`). */
  getProviderName(): string {
    return this.provider.name;
  }

  isConfigured(): boolean {
    return this.provider.isConfigured();
  }

  missingEnvVars(): string[] {
    return this.provider.missingEnvVars();
  }

  /** Public CMS media — CacheControl / CDN-friendly on S3; public ImageKit URL locally. */
  async put(key: string, body: Buffer, contentType: string): Promise<{ url: string }> {
    return this.provider.put(key, body, contentType);
  }

  /**
   * Private object upload (resumes). No public ACL / long cache — access only
   * via short-lived signed GET URLs.
   */
  async putPrivate(key: string, body: Buffer, contentType: string): Promise<void> {
    return this.provider.putPrivate(key, body, contentType);
  }

  /**
   * Temporary signed GET URL for private objects. Default expiry: 5 minutes.
   * Never expose the raw key to unauthenticated clients.
   */
  async getSignedGetUrl(key: string, options?: SignedGetUrlOptions): Promise<string> {
    return this.provider.getSignedGetUrl(key, options);
  }

  async remove(key: string): Promise<void> {
    return this.provider.remove(key);
  }

  publicUrl(key: string): string {
    return this.provider.publicUrl(key);
  }
}

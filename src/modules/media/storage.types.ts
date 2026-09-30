/**
 * Pluggable object-storage providers (S3 in production, ImageKit for local).
 *
 * Careers/media modules talk only to StorageService; provider selection is
 * driven by STORAGE_PROVIDER and never leaks into business logic.
 */

export type StorageProviderName = "s3" | "imagekit";

export interface SignedGetUrlOptions {
  expiresInSeconds?: number;
  downloadFileName?: string;
}

export interface ObjectStorageProvider {
  readonly name: StorageProviderName;

  isConfigured(): boolean;
  missingEnvVars(): string[];

  /** Public CMS media — returns a durable public URL. */
  put(key: string, body: Buffer, contentType: string): Promise<{ url: string }>;

  /**
   * Private object upload (resumes). Access only via short-lived signed GET
   * URLs. The caller-supplied `key` is the stable identifier stored in the DB.
   */
  putPrivate(key: string, body: Buffer, contentType: string): Promise<void>;

  /** Temporary signed GET URL for a previously stored private key. */
  getSignedGetUrl(key: string, options?: SignedGetUrlOptions): Promise<string>;

  /** Best-effort delete (compensation path); failures are logged, not thrown. */
  remove(key: string): Promise<void>;

  publicUrl(key: string): string;
}

export function resolveStorageProviderName(
  value: string | undefined = process.env.STORAGE_PROVIDER,
): StorageProviderName {
  const normalized = (value ?? "s3").trim().toLowerCase();
  if (normalized === "imagekit") return "imagekit";
  return "s3";
}

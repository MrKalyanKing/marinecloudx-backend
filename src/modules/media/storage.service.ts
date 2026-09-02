import { Injectable, Logger } from "@nestjs/common";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

/**
 * Object storage — the S3-compatible backend for CMS media.
 *
 * Deliberately abstracted: the rest of the media module never imports the AWS
 * SDK. Credentials are resolved by the SDK's default provider chain (the IAM
 * role in production), never read from env — there is no long-lived secret to
 * leak. See docs/media.md §3.
 *
 * When `AWS_S3_BUCKET` is unset the module still builds and runs; `isConfigured`
 * reports the state and the upload route returns a 400 naming the missing
 * variable rather than a 500.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly region: string;
  private readonly bucket: string | null;
  private readonly publicBase: string | null;
  private client: S3Client | null = null;

  constructor() {
    this.region = process.env.AWS_REGION ?? "ap-south-1";
    this.bucket = process.env.AWS_S3_BUCKET || null;
    this.publicBase = process.env.AWS_S3_PUBLIC_URL || null;
  }

  isConfigured(): boolean {
    return Boolean(this.bucket);
  }

  missingEnvVars(): string[] {
    return this.isConfigured() ? [] : ["AWS_S3_BUCKET"];
  }

  private s3(): S3Client {
    if (!this.client) this.client = new S3Client({ region: this.region });
    return this.client;
  }

  /** Object first, then the DB row — a failed insert triggers `remove` (compensation). */
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

  async remove(key: string): Promise<void> {
    if (!this.bucket) return;
    try {
      await this.s3().send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (err) {
      // Compensation, not rollback: an orphaned object is the cheaper failure.
      this.logger.error(`Failed to delete orphaned object ${key}`, err as Error);
    }
  }

  publicUrl(key: string): string {
    const base =
      this.publicBase ?? `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
    return `${base.replace(/\/+$/, "")}/${key}`;
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { v7 as uuidv7 } from "uuid";

import { MediaType } from "../../contracts";
import { MediaEntity } from "../../entities";
import { AuditService } from "../audit/audit.service";
import { StorageService } from "./storage.service";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/** Magic-byte signatures — the declared MIME type is never trusted. */
const SIGNATURES: { mime: string; ext: string; test: (b: Buffer) => boolean }[] = [
  { mime: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: "image/png",
    ext: "png",
    test: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a,
  },
  {
    mime: "image/webp",
    ext: "webp",
    test: (b) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP",
  },
];

@Injectable()
export class MediaService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
  ) {}

  storageStatus() {
    return { configured: this.storage.isConfigured(), missing: this.storage.missingEnvVars() };
  }

  /**
   * Upload flow (docs/media.md §8): validate → object first → row → audit.
   * A failed insert triggers a compensating delete of the object.
   */
  async upload(
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer } | undefined,
    actorUserId: string,
  ) {
    if (!this.storage.isConfigured()) {
      throw new BadRequestException(
        `Object storage is not configured. Set: ${this.storage.missingEnvVars().join(", ")}`,
      );
    }
    if (!file) throw new BadRequestException("No file was uploaded.");
    if (file.size > MAX_BYTES) {
      throw new BadRequestException("File exceeds the 10 MB limit.");
    }

    const sig = SIGNATURES.find((s) => s.test(file.buffer));
    if (!sig) {
      // Covers SVG (a document, not a bitmap) and any spoofed extension.
      throw new BadRequestException("Unsupported file type. Only JPEG, PNG and WebP are accepted.");
    }

    const safeName = sanitizeFilename(file.originalname) || `upload.${sig.ext}`;
    const id = uuidv7();
    const storageKey = `media/${id}/${safeName}`;

    const { width, height } = await readDimensions(file.buffer);

    const { url } = await this.storage.put(storageKey, file.buffer, sig.mime);

    try {
      return await this.dataSource.transaction(async (m) => {
        const repo = m.getRepository(MediaEntity);
        const row = await repo.save(
          repo.create({
            id,
            filename: safeName,
            originalFilename: file.originalname.slice(0, 255),
            storageKey,
            url,
            type: MediaType.IMAGE,
            mimeType: sig.mime,
            size: file.size,
            width,
            height,
          }),
        );
        await this.audit.record(
          {
            userId: actorUserId,
            action: "cms.media.created",
            entityType: "media",
            entityId: row.id,
            metadata: { filename: safeName, mimeType: sig.mime, size: file.size },
          },
          m,
        );
        return row;
      });
    } catch (err) {
      await this.storage.remove(storageKey); // compensation
      throw err;
    }
  }

  /** Refuses deletion while anything references the media — returns 409 naming where. */
  async remove(id: string, actorUserId: string) {
    const repo = this.dataSource.getRepository(MediaEntity);
    const media = await repo.findOne({ where: { id } });
    if (!media) throw new NotFoundException();

    const refs = await this.countReferences(id);
    if (refs.total > 0) {
      throw new BadRequestException(
        `In use by ${refs.details.join(", ")}. Detach it before deleting.`,
      );
    }

    await this.storage.remove(media.storageKey);
    await repo.delete(id);
    await this.audit.record({
      userId: actorUserId,
      action: "cms.media.deleted",
      entityType: "media",
      entityId: id,
      metadata: { filename: media.filename },
    });
    return { ok: true };
  }

  private async countReferences(mediaId: string) {
    const q = (sql: string) =>
      this.dataSource
        .query(sql, [mediaId])
        .then((r: { c: string }[]) => Number(r[0]?.c ?? 0));

    const [projectMedia, projectCover, serviceCover, blogCover, testimonialPhoto] =
      await Promise.all([
        q(`SELECT COUNT(*) c FROM "ProjectMedia" WHERE "mediaId" = $1`),
        q(`SELECT COUNT(*) c FROM "Project" WHERE "coverMediaId" = $1`),
        q(`SELECT COUNT(*) c FROM "Service" WHERE "coverMediaId" = $1`),
        q(`SELECT COUNT(*) c FROM "BlogPost" WHERE "coverMediaId" = $1`),
        q(`SELECT COUNT(*) c FROM "Testimonial" WHERE "photoMediaId" = $1`),
      ]);

    const details: string[] = [];
    if (projectMedia) details.push(`${projectMedia} project gallery entr${projectMedia === 1 ? "y" : "ies"}`);
    if (projectCover) details.push(`${projectCover} project cover${projectCover === 1 ? "" : "s"}`);
    if (serviceCover) details.push(`${serviceCover} service cover${serviceCover === 1 ? "" : "s"}`);
    if (blogCover) details.push(`${blogCover} blog cover${blogCover === 1 ? "" : "s"}`);
    if (testimonialPhoto) details.push(`${testimonialPhoto} testimonial photo${testimonialPhoto === 1 ? "" : "s"}`);

    return { total: projectMedia + projectCover + serviceCover + blogCover + testimonialPhoto, details };
  }
}

/** Drops directory components first, then filters to a safe character set. */
function sanitizeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "";
  return base
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+/, "")
    .slice(0, 200);
}

async function readDimensions(buffer: Buffer): Promise<{ width: number | null; height: number | null }> {
  try {
    const sharp = (await import("sharp")).default;
    const meta = await sharp(buffer).metadata();
    return { width: meta.width ?? null, height: meta.height ?? null };
  } catch {
    return { width: null, height: null };
  }
}

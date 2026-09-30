import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { EntityManager } from "typeorm";
import { In, Repository } from "typeorm";

import { buildPagination, newId, resolvePagination } from "../../common";
import {
  ApplicationActivityType,
  ApplicationSource,
  ApplicationStatus,
  JobStatus,
} from "../../contracts";
import {
  ApplicationActivityEntity,
  JobApplicationEntity,
  JobEntity,
  type EducationEntry,
  type WorkExperienceEntry,
} from "../../entities";
import { AuditService } from "../audit/audit.service";
import { MailService } from "../mail/mail.service";
import { StorageService } from "../media/storage.service";
import type {
  ApplicationListQueryDto,
  BulkChangeStatusDto,
  CreateJobDto,
  CreatePublicApplicationDto,
  JobListQueryDto,
  UpdateJobDto,
} from "./dto/careers.dto";
import { ResumeExtractionService } from "./resume-extraction.service";
import { CareersIdService } from "./careers-id.service";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  [ApplicationStatus.NEW]: "Submitted",
  [ApplicationStatus.UNDER_REVIEW]: "Under Review",
  [ApplicationStatus.SHORTLISTED]: "Shortlisted",
  [ApplicationStatus.INTERVIEW]: "Interview",
  [ApplicationStatus.SELECTED]: "Selected",
  [ApplicationStatus.REJECTED]: "Rejected",
};

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ALLOWED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "text/markdown",
]);

/** Multer file shape — avoids depending on `@types/multer`. */
type UploadedResume = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class CareersService {
  private readonly logger = new Logger(CareersService.name);

  constructor(
    @InjectRepository(JobEntity) private readonly jobs: Repository<JobEntity>,
    @InjectRepository(JobApplicationEntity)
    private readonly applications: Repository<JobApplicationEntity>,
    @InjectRepository(ApplicationActivityEntity)
    private readonly activities: Repository<ApplicationActivityEntity>,
    private readonly storage: StorageService,
    private readonly extraction: ResumeExtractionService,
    private readonly careersIds: CareersIdService,
    private readonly audit: AuditService,
    private readonly mail: MailService,
  ) {}

  /* ------------------------------------------------------------------------ */
  /* Dashboard                                                                 */
  /* ------------------------------------------------------------------------ */

  async dashboard(jobId?: string) {
    const qb = this.applications.createQueryBuilder("a");
    if (jobId) qb.andWhere("a.jobId = :jobId", { jobId });

    const rows = await qb
      .select("a.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("a.status")
      .getRawMany<{ status: ApplicationStatus; count: string }>();

    const byStatus = Object.fromEntries(
      Object.values(ApplicationStatus).map((s) => [s, 0]),
    ) as Record<ApplicationStatus, number>;

    let total = 0;
    for (const row of rows) {
      const n = Number(row.count);
      byStatus[row.status] = n;
      total += n;
    }

    return {
      total,
      new: byStatus.NEW,
      underReview: byStatus.UNDER_REVIEW,
      shortlisted: byStatus.SHORTLISTED,
      interview: byStatus.INTERVIEW,
      selected: byStatus.SELECTED,
      rejected: byStatus.REJECTED,
      byStatus,
      jobId: jobId ?? null,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Jobs                                                                      */
  /* ------------------------------------------------------------------------ */

  async listJobs(query: JobListQueryDto, opts?: { publicOnly?: boolean }) {
    const pagination = resolvePagination({ page: query.page, pageSize: query.pageSize });
    const qb = this.jobs.createQueryBuilder("j").orderBy("j.createdAt", "DESC");

    if (opts?.publicOnly) {
      qb.andWhere("j.status = :published", { published: JobStatus.PUBLISHED });
      qb.andWhere(
        "(j.applicationDeadline IS NULL OR j.applicationDeadline >= NOW())",
      );
    } else if (query.status) {
      qb.andWhere("j.status = :status", { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        "(j.title ILIKE :s OR j.department ILIKE :s OR j.location ILIKE :s)",
        { s: `%${query.search}%` },
      );
    }
    if (query.department) {
      qb.andWhere("j.department ILIKE :dept", { dept: `%${query.department}%` });
    }
    if (query.location) {
      qb.andWhere("j.location ILIKE :loc", { loc: `%${query.location}%` });
    }

    const total = await qb.getCount();
    const data = await qb.skip(pagination.skip).take(pagination.take).getMany();
    const counts = await this.applicationCountsByJobIds(data.map((j) => j.id));
    return {
      data: data.map((job) => this.serializeJob(job, counts.get(job.id) ?? 0)),
      pagination: buildPagination(pagination.page, pagination.pageSize, total),
    };
  }

  async getJobById(id: string) {
    const job = await this.jobs.findOne({ where: { id } });
    if (!job) throw new NotFoundException("Job not found.");
    const counts = await this.applicationCountsByJobIds([id]);
    return this.serializeJob(job, counts.get(id) ?? 0);
  }

  async getPublishedJobBySlug(slug: string) {
    const job = await this.jobs.findOne({
      where: { slug, status: JobStatus.PUBLISHED },
    });
    if (!job) throw new NotFoundException("This position is no longer available.");
    if (job.applicationDeadline && job.applicationDeadline < new Date()) {
      throw new NotFoundException("The application deadline for this position has passed.");
    }
    return this.serializeJob(job);
  }

  async createJob(dto: CreateJobDto, actorUserId: string) {
    const slug = await this.ensureUniqueSlug(dto.slug ?? this.slugify(dto.title));
    const status = dto.status ?? JobStatus.DRAFT;

    const saved = await this.jobs.manager.transaction(async (em) => {
      const jobCode = await this.careersIds.nextJobCode(em);
      const job = em.create(JobEntity, {
        title: dto.title.trim(),
        slug,
        jobCode,
        department: dto.department?.trim() || null,
        location: dto.location?.trim() || null,
        employmentType: dto.employmentType,
        experience: dto.experience?.trim() || null,
        description: dto.description.trim(),
        responsibilities: dto.responsibilities?.trim() || null,
        requirements: dto.requirements?.trim() || null,
        niceToHave: dto.niceToHave?.trim() || null,
        salaryRange: dto.salaryRange?.trim() || null,
        applicationDeadline: dto.applicationDeadline
          ? new Date(dto.applicationDeadline)
          : null,
        status,
        publishedAt: status === JobStatus.PUBLISHED ? new Date() : null,
      });
      return em.save(job);
    });

    await this.audit.record({
      userId: actorUserId,
      action: "careers.job.created",
      entityType: "job",
      entityId: saved.id,
      metadata: { title: saved.title, status: saved.status, jobCode: saved.jobCode },
    });
    return this.serializeJob(saved);
  }

  async updateJob(id: string, dto: UpdateJobDto, actorUserId: string) {
    const job = await this.jobs.findOne({ where: { id } });
    if (!job) throw new NotFoundException("Job not found.");

    if (dto.title !== undefined) job.title = dto.title.trim();
    if (dto.slug !== undefined) {
      job.slug = await this.ensureUniqueSlug(dto.slug, id);
    }
    if (dto.department !== undefined) job.department = dto.department?.trim() || null;
    if (dto.location !== undefined) job.location = dto.location?.trim() || null;
    if (dto.employmentType !== undefined) job.employmentType = dto.employmentType;
    if (dto.experience !== undefined) job.experience = dto.experience?.trim() || null;
    if (dto.description !== undefined) job.description = dto.description.trim();
    if (dto.responsibilities !== undefined)
      job.responsibilities = dto.responsibilities?.trim() || null;
    if (dto.requirements !== undefined) job.requirements = dto.requirements?.trim() || null;
    if (dto.niceToHave !== undefined) job.niceToHave = dto.niceToHave?.trim() || null;
    if (dto.salaryRange !== undefined) job.salaryRange = dto.salaryRange?.trim() || null;
    if (dto.applicationDeadline !== undefined) {
      job.applicationDeadline = dto.applicationDeadline
        ? new Date(dto.applicationDeadline)
        : null;
    }
    if (dto.status !== undefined) {
      const prev = job.status;
      job.status = dto.status;
      if (dto.status === JobStatus.PUBLISHED && prev !== JobStatus.PUBLISHED) {
        job.publishedAt = new Date();
      }
    }

    const saved = await this.jobs.save(job);
    await this.audit.record({
      userId: actorUserId,
      action: "careers.job.updated",
      entityType: "job",
      entityId: saved.id,
      metadata: { status: saved.status },
    });
    return this.serializeJob(saved);
  }

  async deleteJob(id: string, actorUserId: string) {
    const job = await this.jobs.findOne({ where: { id } });
    if (!job) throw new NotFoundException("Job not found.");

    const appCount = await this.applications.count({ where: { jobId: id } });
    if (appCount > 0) {
      // Soft-archive rather than hard-delete when applications exist
      job.status = JobStatus.ARCHIVED;
      await this.jobs.save(job);
      await this.audit.record({
        userId: actorUserId,
        action: "careers.job.archived",
        entityType: "job",
        entityId: id,
        metadata: { reason: "has_applications", applicationCount: appCount },
      });
      return { ok: true, archived: true };
    }

    await this.jobs.remove(job);
    await this.audit.record({
      userId: actorUserId,
      action: "careers.job.deleted",
      entityType: "job",
      entityId: id,
    });
    return { ok: true, archived: false };
  }

  /* ------------------------------------------------------------------------ */
  /* Applications                                                              */
  /* ------------------------------------------------------------------------ */

  async listApplications(query: ApplicationListQueryDto) {
    const pagination = resolvePagination({ page: query.page, pageSize: query.pageSize });
    const qb = this.applications
      .createQueryBuilder("a")
      .leftJoinAndSelect("a.job", "job")
      .orderBy("a.createdAt", "DESC");

    if (query.jobId) qb.andWhere("a.jobId = :jobId", { jobId: query.jobId });
    if (query.status) qb.andWhere("a.status = :status", { status: query.status });
    if (query.location) {
      qb.andWhere("a.location ILIKE :loc", { loc: `%${query.location}%` });
    }
    if (query.skill) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(a.skills) s
          WHERE s ILIKE :skill
        )`,
        { skill: `%${query.skill}%` },
      );
    }
    if (query.minExperience !== undefined) {
      qb.andWhere("a.yearsOfExperience >= :minExp", { minExp: query.minExperience });
    }
    if (query.maxExperience !== undefined) {
      qb.andWhere("a.yearsOfExperience <= :maxExp", { maxExp: query.maxExperience });
    }
    if (query.experience) {
      qb.andWhere("CAST(a.yearsOfExperience AS text) ILIKE :exp", {
        exp: `%${query.experience}%`,
      });
    }
    if (query.applied && query.applied !== "any") {
      const hours = query.applied === "24h" ? 24 : query.applied === "7d" ? 24 * 7 : 24 * 30;
      qb.andWhere(`a.createdAt >= NOW() - INTERVAL '${hours} hours'`);
    }
    if (query.search) {
      qb.andWhere(
        `(a.candidateName ILIKE :s OR a.email ILIKE :s OR a.phone ILIKE :s OR job.title ILIKE :s)`,
        { s: `%${query.search}%` },
      );
    }

    const total = await qb.getCount();
    const rows = await qb.skip(pagination.skip).take(pagination.take).getMany();
    return {
      data: rows.map((row) => this.serializeApplicationListItem(row)),
      pagination: buildPagination(pagination.page, pagination.pageSize, total),
    };
  }

  async getApplicationById(id: string) {
    const app = await this.applications.findOne({
      where: { id },
      relations: { job: true, activities: { performedBy: true } },
    });
    if (!app) throw new NotFoundException("Application not found.");
    if (app.activities) {
      app.activities.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }
    return this.serializeApplicationDetail(app);
  }

  async changeStatus(id: string, status: ApplicationStatus, actorUserId: string) {
    const app = await this.applications.findOne({ where: { id } });
    if (!app) throw new NotFoundException("Application not found.");
    if (app.status === status) return this.getApplicationById(id);

    const oldStatus = app.status;
    app.status = status;
    await this.applications.manager.transaction(async (em) => {
      await em.save(app);
      await this.logActivity(em, {
        applicationId: id,
        action: ApplicationActivityType.STATUS_CHANGED,
        description: `Application moved to ${STATUS_LABEL[status]}`,
        oldStatus,
        newStatus: status,
        performedById: actorUserId,
      });
      await this.audit.record(
        {
          userId: actorUserId,
          action: "careers.application.status_changed",
          entityType: "job_application",
          entityId: id,
          metadata: { oldStatus, newStatus: status },
        },
        em,
      );
    });

    return this.getApplicationById(id);
  }

  async bulkChangeStatus(dto: BulkChangeStatusDto, actorUserId: string) {
    const ids = [...new Set(dto.ids)].slice(0, 100);
    if (ids.length === 0) throw new BadRequestException("Select at least one application.");

    const apps = await this.applications.find({ where: { id: In(ids) } });
    if (apps.length === 0) throw new NotFoundException("No matching applications found.");

    let updated = 0;
    await this.applications.manager.transaction(async (em) => {
      for (const app of apps) {
        if (app.status === dto.status) continue;
        const oldStatus = app.status;
        app.status = dto.status;
        await em.save(app);
        await this.logActivity(em, {
          applicationId: app.id,
          action: ApplicationActivityType.STATUS_CHANGED,
          description: `Application moved to ${STATUS_LABEL[dto.status]} (bulk)`,
          oldStatus,
          newStatus: dto.status,
          performedById: actorUserId,
        });
        updated += 1;
      }
      await this.audit.record(
        {
          userId: actorUserId,
          action: "careers.application.bulk_status_changed",
          entityType: "job_application",
          metadata: { status: dto.status, count: updated, ids },
        },
        em,
      );
    });

    return { ok: true, updated };
  }

  async getResumeUrl(
    id: string,
    disposition: "preview" | "download" = "preview",
  ): Promise<{ url: string; fileName: string; mimeType: string; expiresInSeconds: number }> {
    const app = await this.applications.findOne({ where: { id } });
    if (!app) throw new NotFoundException("Application not found.");
    if (!app.resumeKey || !app.resumeFileName) {
      throw new NotFoundException("No resume is attached to this application.");
    }
    if (!this.storage.isConfigured()) {
      throw new BadRequestException("File storage is not configured.");
    }

    const expiresInSeconds = 5 * 60;
    const url = await this.storage.getSignedGetUrl(app.resumeKey, {
      expiresInSeconds,
      downloadFileName: disposition === "download" ? app.resumeFileName : undefined,
    });

    return {
      url,
      fileName: app.resumeFileName,
      mimeType: app.resumeMimeType ?? "application/pdf",
      expiresInSeconds,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Public apply + parse                                                      */
  /* ------------------------------------------------------------------------ */

  async parseResume(file: UploadedResume) {
    this.assertResumeFile(file);
    return this.extraction.extract(file.buffer, file.mimetype, file.originalname);
  }

  async submitApplication(
    jobId: string,
    dto: CreatePublicApplicationDto,
    file?: UploadedResume,
  ): Promise<{
    id: string;
    applicationCode: string;
    jobCode: string;
    jobTitle: string;
  }> {
    const job = await this.jobs.findOne({ where: { id: jobId } });
    if (!job || job.status !== JobStatus.PUBLISHED) {
      throw new NotFoundException("This position is no longer accepting applications.");
    }
    if (job.applicationDeadline && job.applicationDeadline < new Date()) {
      throw new BadRequestException("The application deadline for this position has passed.");
    }

    const email = dto.email.trim().toLowerCase();
    const existing = await this.applications.findOne({
      where: { jobId, email },
    });
    if (existing) {
      throw new BadRequestException(
        "You've already applied for this role with this email. We'll be in touch if there's an update.",
      );
    }

    if (file) this.assertResumeFile(file);

    const applicationId = newId();
    let resumeMeta: {
      resumeKey: string;
      resumeFileName: string;
      resumeMimeType: string;
      resumeSize: number;
      resumeUploadedAt: Date;
    } | null = null;

    if (file) {
      if (!this.storage.isConfigured()) {
        this.logger.error(
          `Resume storage is not configured (provider=${this.storage.getProviderName()}). Missing: ${this.storage.missingEnvVars().join(", ") || "unknown"}`,
        );
        throw new BadRequestException(
          "We couldn't upload your resume just now. Please wait a few seconds and try again.",
        );
      }
      const safeName = this.sanitizeFileName(file.originalname);
      const now = new Date();
      const yyyy = now.getUTCFullYear();
      const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
      const key = `careers/resumes/${yyyy}/${mm}/application-${applicationId}/${safeName}`;
      try {
        await this.storage.putPrivate(key, file.buffer, file.mimetype);
      } catch (err) {
        this.logger.error("Resume upload failed", err as Error);
        throw new BadRequestException(
          "We couldn't upload your resume just now. Please wait a few seconds and try again.",
        );
      }
      resumeMeta = {
        resumeKey: key,
        resumeFileName: safeName,
        resumeMimeType: file.mimetype,
        resumeSize: file.size,
        resumeUploadedAt: now,
      };
    }

    const source =
      dto.applicationSource ??
      (file ? ApplicationSource.RESUME_UPLOAD : ApplicationSource.MANUAL_APPLICATION);

    let applicationCode = "";
    try {
      await this.applications.manager.transaction(async (em) => {
        applicationCode = await this.careersIds.nextApplicationCode(em);
        const app = em.create(JobApplicationEntity, {
          id: applicationId,
          jobId,
          applicationCode,
          candidateName: dto.candidateName.trim(),
          email,
          phone: dto.phone?.trim() || null,
          location: dto.location?.trim() || null,
          linkedinUrl: dto.linkedinUrl?.trim() || null,
          githubUrl: dto.githubUrl?.trim() || null,
          portfolioUrl: dto.portfolioUrl?.trim() || null,
          currentJobTitle: dto.currentJobTitle?.trim() || null,
          yearsOfExperience: dto.yearsOfExperience ?? null,
          summary: dto.summary?.trim() || null,
          skills: (dto.skills ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 50),
          education: (dto.education as EducationEntry[] | undefined) ?? [],
          workExperience: (dto.workExperience as WorkExperienceEntry[] | undefined) ?? [],
          coverLetter: dto.coverLetter?.trim() || null,
          noticePeriod: dto.noticePeriod?.trim() || null,
          currentCtc: dto.currentCtc?.trim() || null,
          expectedCtc: dto.expectedCtc?.trim() || null,
          applicationSource: source,
          status: ApplicationStatus.NEW,
          ...(resumeMeta ?? {}),
        });
        await em.save(app);
        await this.logActivity(em, {
          applicationId,
          action: ApplicationActivityType.APPLICATION_RECEIVED,
          description: `Application received (${applicationCode})`,
          newStatus: ApplicationStatus.NEW,
          performedById: null,
        });
        if (resumeMeta) {
          await this.logActivity(em, {
            applicationId,
            action: ApplicationActivityType.RESUME_UPLOADED,
            description: `Resume uploaded: ${resumeMeta.resumeFileName}`,
            performedById: null,
          });
        }
      });
    } catch (err) {
      if (resumeMeta) await this.storage.remove(resumeMeta.resumeKey);
      this.logger.error("Application save failed", err as Error);
      throw new BadRequestException(
        "Something went wrong while sending your application. Please wait a moment and try again.",
      );
    }

    // Fire-and-forget no-reply confirmation — never blocks or rolls back submit.
    this.mail
      .sendApplicationConfirmation({
        candidateName: dto.candidateName.trim(),
        candidateEmail: email,
        jobTitle: job.title,
        jobCode: job.jobCode,
        applicationCode,
      })
      .catch(() => {
        /* swallowed — mail errors are logged inside MailService */
      });

    return {
      id: applicationId,
      applicationCode,
      jobCode: job.jobCode,
      jobTitle: job.title,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Internals                                                                 */
  /* ------------------------------------------------------------------------ */

  private async applicationCountsByJobIds(jobIds: string[]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (jobIds.length === 0) return map;
    const rows = await this.applications
      .createQueryBuilder("a")
      .select("a.jobId", "jobId")
      .addSelect("COUNT(*)", "count")
      .where("a.jobId IN (:...jobIds)", { jobIds })
      .groupBy("a.jobId")
      .getRawMany<{ jobId: string; count: string }>();
    for (const row of rows) map.set(row.jobId, Number(row.count));
    return map;
  }

  private async logActivity(
    em: EntityManager,
    input: {
      applicationId: string;
      action: ApplicationActivityType;
      description?: string | null;
      oldStatus?: ApplicationStatus | null;
      newStatus?: ApplicationStatus | null;
      performedById?: string | null;
      metadata?: Record<string, unknown> | null;
    },
  ) {
    const repo = em.getRepository(ApplicationActivityEntity);
    await repo.save(
      repo.create({
        applicationId: input.applicationId,
        action: input.action,
        description: input.description ?? null,
        oldStatus: input.oldStatus ?? null,
        newStatus: input.newStatus ?? null,
        performedById: input.performedById ?? null,
        metadata: input.metadata ?? null,
      }),
    );
  }

  private assertResumeFile(file: UploadedResume) {
    if (!file?.buffer?.length) {
      throw new BadRequestException("Please choose a resume file to upload.");
    }
    if (file.size > MAX_RESUME_BYTES) {
      throw new BadRequestException("Your resume is a bit too large. Please upload a file under 5 MB.");
    }
    const mime = file.mimetype || "application/octet-stream";
    const lower = file.originalname.toLowerCase();
    const ok =
      ALLOWED_RESUME_TYPES.has(mime) ||
      lower.endsWith(".pdf") ||
      lower.endsWith(".docx") ||
      lower.endsWith(".doc") ||
      lower.endsWith(".txt") ||
      lower.endsWith(".md");
    if (!ok) {
      throw new BadRequestException("Please upload your resume as a PDF or DOCX file.");
    }
  }

  private sanitizeFileName(name: string): string {
    const base = name.split(/[/\\]/).pop() ?? "resume.pdf";
    return base.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 180) || "resume.pdf";
  }

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 160) || "job";
  }

  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let candidate = this.slugify(slug);
    let n = 0;
    for (;;) {
      const existing = await this.jobs.findOne({ where: { slug: candidate } });
      if (!existing || existing.id === excludeId) return candidate;
      n += 1;
      candidate = `${this.slugify(slug)}-${n}`;
    }
  }

  private serializeJob(job: JobEntity, applicationCount = 0) {
    return {
      id: job.id,
      jobCode: job.jobCode,
      title: job.title,
      slug: job.slug,
      department: job.department,
      location: job.location,
      employmentType: job.employmentType,
      experience: job.experience,
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      niceToHave: job.niceToHave,
      salaryRange: job.salaryRange,
      applicationDeadline: job.applicationDeadline,
      status: job.status,
      publishedAt: job.publishedAt,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      applicationCount,
    };
  }

  private serializeApplicationListItem(app: JobApplicationEntity) {
    return {
      id: app.id,
      applicationCode: app.applicationCode,
      candidateName: app.candidateName,
      email: app.email,
      phone: app.phone,
      location: app.location,
      currentJobTitle: app.currentJobTitle,
      yearsOfExperience: app.yearsOfExperience,
      skills: app.skills ?? [],
      status: app.status,
      applicationSource: app.applicationSource,
      hasResume: Boolean(app.resumeKey),
      resumeFileName: app.resumeFileName,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      job: app.job
        ? {
            id: app.job.id,
            jobCode: app.job.jobCode,
            title: app.job.title,
            slug: app.job.slug,
            status: app.job.status,
          }
        : null,
    };
  }

  private serializeApplicationDetail(app: JobApplicationEntity) {
    return {
      ...this.serializeApplicationListItem(app),
      linkedinUrl: app.linkedinUrl,
      githubUrl: app.githubUrl,
      portfolioUrl: app.portfolioUrl,
      summary: app.summary,
      education: app.education ?? [],
      workExperience: app.workExperience ?? [],
      coverLetter: app.coverLetter,
      noticePeriod: app.noticePeriod,
      currentCtc: app.currentCtc,
      expectedCtc: app.expectedCtc,
      resumeMimeType: app.resumeMimeType,
      resumeSize: app.resumeSize,
      resumeUploadedAt: app.resumeUploadedAt,
      activities: (app.activities ?? []).map((a) => ({
        id: a.id,
        action: a.action,
        description: a.description,
        oldStatus: a.oldStatus,
        newStatus: a.newStatus,
        createdAt: a.createdAt,
        performedBy: a.performedBy
          ? { id: a.performedBy.id, name: a.performedBy.name }
          : null,
      })),
    };
  }
}

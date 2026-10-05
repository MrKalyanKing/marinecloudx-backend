import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { createHash, randomBytes } from "crypto";
import type { EntityManager } from "typeorm";
import { DataSource, In, Repository } from "typeorm";

import { buildPagination, newId, resolvePagination } from "../../common";
import {
  ApplicationActivityType,
  ApplicationSource,
  ApplicationStatus,
  InterviewBookingStatus,
  InterviewRoundStatus,
  InterviewSlotStatus,
  JobStatus,
  SchedulingTokenStatus,
} from "../../contracts";
import {
  ApplicationActivityEntity,
  InterviewAvailabilityEntity,
  InterviewBookingEntity,
  InterviewRoundEntity,
  InterviewSlotEntity,
  JobApplicationEntity,
  JobEntity,
  SchedulingTokenEntity,
  type EducationEntry,
  type TimeWindowEntry,
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
import type {
  BookSlotDto,
  CancelBookingDto,
  ConfigureAvailabilityDto,
  CreateCandidateDto,
  CreateInterviewRoundDto,
  RescheduleBookingDto,
} from "./dto/interview-scheduling.dto";
import { ResumeExtractionService } from "./resume-extraction.service";
import { CareersIdService } from "./careers-id.service";
import { IcsService } from "./ics.service";

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
export class CareersService implements OnModuleInit {
  private readonly logger = new Logger(CareersService.name);

  async onModuleInit() {
    try {
      await this.dataSource.query(
        `ALTER TABLE "InterviewRound" ADD COLUMN IF NOT EXISTS "meetingLink" text;`,
      );
    } catch (err) {
      this.logger.warn("Could not ensure meetingLink on InterviewRound", err);
    }
  }

  constructor(
    @InjectRepository(JobEntity) private readonly jobs: Repository<JobEntity>,
    @InjectRepository(JobApplicationEntity)
    private readonly applications: Repository<JobApplicationEntity>,
    @InjectRepository(ApplicationActivityEntity)
    private readonly activities: Repository<ApplicationActivityEntity>,
    @InjectRepository(InterviewRoundEntity)
    private readonly interviewRounds: Repository<InterviewRoundEntity>,
    @InjectRepository(InterviewAvailabilityEntity)
    private readonly interviewAvailabilities: Repository<InterviewAvailabilityEntity>,
    @InjectRepository(InterviewSlotEntity)
    private readonly interviewSlots: Repository<InterviewSlotEntity>,
    @InjectRepository(InterviewBookingEntity)
    private readonly interviewBookings: Repository<InterviewBookingEntity>,
    @InjectRepository(SchedulingTokenEntity)
    private readonly schedulingTokens: Repository<SchedulingTokenEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(StorageService) private readonly storage: StorageService,
    @Inject(ResumeExtractionService) private readonly extraction: ResumeExtractionService,
    @Inject(CareersIdService) private readonly careersIds: CareersIdService,
    @Inject(AuditService) private readonly audit: AuditService,
    @Inject(MailService) private readonly mail: MailService,
    @Inject(IcsService) private readonly ics: IcsService,
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
      relations: {
        job: true,
        activities: { performedBy: true },
        interviewRounds: {
          availabilities: true,
          slots: true,
          bookings: { interviewSlot: true },
          tokens: true,
        },
      },
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
        const missing = this.storage.missingEnvVars().join(", ") || "AWS_S3_BUCKET";
        this.logger.error(
          `Resume storage is not configured (provider=${this.storage.getProviderName()}). Missing: ${missing}`,
        );
        throw new BadRequestException(
          `Resume storage is not configured. Missing environment variable: ${missing}`,
        );
      }
      const safeName = this.sanitizeFileName(file.originalname);
      const now = new Date();
      const yyyy = now.getUTCFullYear();
      const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
      const key = `careers/resumes/${yyyy}/${mm}/application-${applicationId}/${safeName}`;
      try {
        await this.storage.putPrivate(key, file.buffer, file.mimetype);
      } catch (err: unknown) {
        this.logger.error("Resume upload failed", err as Error);
        const errorObj = err as Record<string, unknown> | undefined;
        const isAccessDenied =
          errorObj?.name === "AccessDenied" ||
          errorObj?.Code === "AccessDenied" ||
          String(errorObj?.message ?? "").includes("Access Denied");
        const msg = isAccessDenied
          ? "S3 Access Denied: Lambda IAM role lacks s3:PutObject permission on the S3 bucket."
          : `We couldn't upload your resume (${(err as Error)?.message || "storage error"}). Please check permissions and try again.`;
        throw new BadRequestException(msg);
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
      interviewRounds: (app.interviewRounds ?? [])
        .sort(
          (a, b) =>
            a.roundNumber - b.roundNumber ||
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
        .map((r) => this.serializeInterviewRound(r)),
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Interview Scheduling — Admin                                             */
  /* ------------------------------------------------------------------------ */

  async addCandidate(dto: CreateCandidateDto, actorUserId: string) {
    const job = await this.jobs.findOne({ where: { id: dto.jobId } });
    if (!job) throw new NotFoundException(`Job with ID ${dto.jobId} not found.`);

    const applicationCode = await this.careersIds.nextApplicationCode(this.applications.manager);

    const app = this.applications.create({
      id: newId(),
      jobId: job.id,
      applicationCode,
      candidateName: dto.candidateName.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone ? dto.phone.trim() : null,
      summary: dto.notes ? dto.notes.trim() : null,
      applicationSource: dto.applicationSource,
      status: dto.status || ApplicationStatus.SHORTLISTED,
      skills: [],
      education: [],
      workExperience: [],
    });

    await this.applications.save(app);

    const sourceLabel =
      dto.applicationSource === ApplicationSource.LINKEDIN
        ? "LinkedIn"
        : dto.applicationSource === ApplicationSource.REFERRAL
        ? "Referral"
        : dto.applicationSource === ApplicationSource.MANUAL
        ? "Manual entry"
        : dto.applicationSource;

    await this.logActivity(this.applications.manager, {
      applicationId: app.id,
      action: ApplicationActivityType.APPLICATION_RECEIVED,
      description: `Candidate added manually (${sourceLabel}) by recruitment admin`,
      oldStatus: null,
      newStatus: app.status,
      performedById: actorUserId,
      metadata: { source: dto.applicationSource, jobId: job.id, jobTitle: job.title },
    });

    await this.audit.record({
      userId: actorUserId,
      action: "careers.candidate.created",
      entityType: "job_application",
      entityId: app.id,
      metadata: {
        candidateName: app.candidateName,
        email: app.email,
        source: dto.applicationSource,
        jobId: job.id,
      },
    });

    return this.getApplicationById(app.id);
  }

  async createInterviewRound(
    applicationId: string,
    dto: CreateInterviewRoundDto,
    actorUserId: string,
  ) {
    const app = await this.applications.findOne({
      where: { id: applicationId },
      relations: { job: true },
    });
    if (!app) throw new NotFoundException("Application not found.");

    const round = this.interviewRounds.create({
      id: newId(),
      applicationId,
      roundNumber: dto.roundNumber ?? 1,
      title: dto.title.trim(),
      durationMinutes: dto.durationMinutes ?? 30,
      status: InterviewRoundStatus.PENDING,
      notes: dto.notes ? dto.notes.trim() : null,
      meetingLink: dto.meetingLink ? dto.meetingLink.trim() : null,
    });

    await this.interviewRounds.save(round);

    await this.audit.record({
      userId: actorUserId,
      action: "careers.interview_round.created",
      entityType: "interview_round",
      entityId: round.id,
      metadata: { applicationId, roundNumber: round.roundNumber, title: round.title },
    });

    return this.getInterviewRoundById(round.id);
  }

  async updateRoundMeetingLink(roundId: string, meetingLink: string, actorUserId: string) {
    const round = await this.interviewRounds.findOne({
      where: { id: roundId },
      relations: { bookings: true },
    });
    if (!round) throw new NotFoundException("Interview round not found.");

    const trimmed = meetingLink.trim();
    round.meetingLink = trimmed;
    await this.interviewRounds.save(round);

    // If an active booking exists for this round, update its meeting link too
    const activeBooking = (round.bookings ?? []).find(
      (b) => b.status === InterviewBookingStatus.SCHEDULED,
    );
    if (activeBooking) {
      activeBooking.meetingLink = trimmed;
      await this.interviewBookings.save(activeBooking);
    }

    await this.audit.record({
      userId: actorUserId,
      action: "careers.interview_round.meeting_link_updated",
      entityType: "interview_round",
      entityId: round.id,
      metadata: { meetingLink: trimmed },
    });

    return { success: true, meetingLink: trimmed };
  }

  async updateBookingMeetingLink(bookingId: string, meetingLink: string, actorUserId: string) {
    const booking = await this.interviewBookings.findOne({
      where: { id: bookingId },
      relations: { interviewRound: true },
    });
    if (!booking) throw new NotFoundException("Interview booking not found.");

    const trimmed = meetingLink.trim();
    booking.meetingLink = trimmed;
    await this.interviewBookings.save(booking);

    if (booking.interviewRound) {
      booking.interviewRound.meetingLink = trimmed;
      await this.interviewRounds.save(booking.interviewRound);
    }

    await this.audit.record({
      userId: actorUserId,
      action: "careers.interview_booking.meeting_link_updated",
      entityType: "interview_booking",
      entityId: booking.id,
      metadata: { meetingLink: trimmed },
    });

    return { success: true, meetingLink: trimmed };
  }

  async getInterviewRoundsForApplication(applicationId: string) {
    const rounds = await this.interviewRounds.find({
      where: { applicationId },
      relations: {
        availabilities: true,
        slots: true,
        bookings: { interviewSlot: true },
        tokens: true,
      },
      order: { roundNumber: "ASC", createdAt: "ASC" },
    });

    return rounds.map((r) => this.serializeInterviewRound(r));
  }

  async getInterviewRoundById(id: string) {
    const round = await this.interviewRounds.findOne({
      where: { id },
      relations: {
        application: { job: true },
        availabilities: true,
        slots: true,
        bookings: { interviewSlot: true },
        tokens: true,
      },
    });
    if (!round) throw new NotFoundException("Interview round not found.");
    return this.serializeInterviewRound(round);
  }

  calculateSlots(params: {
    startDate: string;
    endDate: string;
    daysOfWeek: string[];
    timeWindows: TimeWindowEntry[];
    durationMinutes: number;
    bufferMinutes: number;
    timezone: string;
  }) {
    const {
      startDate,
      endDate,
      daysOfWeek,
      timeWindows,
      durationMinutes,
      bufferMinutes,
      timezone,
    } = params;
    const selectedDays = new Set(daysOfWeek.map((d) => d.toUpperCase()));
    const now = new Date();

    const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
    const [endYear, endMonth, endDay] = endDate.split("-").map(Number);

    const curDate = new Date(Date.UTC(startYear, startMonth - 1, startDay, 12, 0, 0));
    const finalDate = new Date(Date.UTC(endYear, endMonth - 1, endDay, 12, 0, 0));

    const generatedSlots: Array<{
      dateStr: string;
      startAt: Date;
      endAt: Date;
      timezone: string;
    }> = [];

    while (curDate <= finalDate) {
      const y = curDate.getUTCFullYear();
      const m = curDate.getUTCMonth() + 1;
      const d = curDate.getUTCDate();
      const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

      const noonInTz = parseZonedDateTime(y, m, d, 12, 0, timezone);
      const weekday = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "short",
      })
        .format(noonInTz)
        .toUpperCase();

      if (selectedDays.has(weekday)) {
        for (const window of timeWindows) {
          const [startH, startMin] = window.startTime.split(":").map(Number);
          const [endH, endMin] = window.endTime.split(":").map(Number);

          const windowStartMinutes = startH * 60 + startMin;
          const windowEndMinutes = endH * 60 + endMin;

          let slotStartMinutes = windowStartMinutes;
          while (slotStartMinutes + durationMinutes <= windowEndMinutes) {
            const slotEndMinutes = slotStartMinutes + durationMinutes;

            const slotStartH = Math.floor(slotStartMinutes / 60);
            const slotStartM = slotStartMinutes % 60;
            const slotEndH = Math.floor(slotEndMinutes / 60);
            const slotEndM = slotEndMinutes % 60;

            const startAt = parseZonedDateTime(y, m, d, slotStartH, slotStartM, timezone);
            const endAt = parseZonedDateTime(y, m, d, slotEndH, slotEndM, timezone);

            if (startAt.getTime() > now.getTime()) {
              generatedSlots.push({
                dateStr,
                startAt,
                endAt,
                timezone,
              });
            }

            slotStartMinutes = slotEndMinutes + bufferMinutes;
          }
        }
      }

      curDate.setUTCDate(curDate.getUTCDate() + 1);
    }

    return generatedSlots;
  }

  async previewSlots(roundId: string, dto: ConfigureAvailabilityDto) {
    const round = await this.interviewRounds.findOne({ where: { id: roundId } });
    if (!round) throw new NotFoundException("Interview round not found.");

    const duration = dto.durationMinutes ?? round.durationMinutes ?? 30;
    const buffer = dto.bufferMinutes ?? 0;
    const tz = dto.timezone ?? "Asia/Kolkata";

    const slots = this.calculateSlots({
      startDate: dto.startDate,
      endDate: dto.endDate,
      daysOfWeek: dto.daysOfWeek,
      timeWindows: dto.timeWindows,
      durationMinutes: duration,
      bufferMinutes: buffer,
      timezone: tz,
    });

    const previewByDate: Record<string, number> = {};
    for (const s of slots) {
      previewByDate[s.dateStr] = (previewByDate[s.dateStr] ?? 0) + 1;
    }

    return {
      totalSlots: slots.length,
      totalDays: Object.keys(previewByDate).length,
      durationMinutes: duration,
      bufferMinutes: buffer,
      timezone: tz,
      previewByDate,
    };
  }

  async generateSlots(
    roundId: string,
    dto: ConfigureAvailabilityDto,
    actorUserId: string,
  ) {
    const round = await this.interviewRounds.findOne({ where: { id: roundId } });
    if (!round) throw new NotFoundException("Interview round not found.");

    const duration = dto.durationMinutes ?? round.durationMinutes ?? 30;
    const buffer = dto.bufferMinutes ?? 0;
    const tz = dto.timezone ?? "Asia/Kolkata";

    const slotsToCreate = this.calculateSlots({
      startDate: dto.startDate,
      endDate: dto.endDate,
      daysOfWeek: dto.daysOfWeek,
      timeWindows: dto.timeWindows,
      durationMinutes: duration,
      bufferMinutes: buffer,
      timezone: tz,
    });

    if (slotsToCreate.length === 0) {
      throw new BadRequestException(
        "No upcoming slots could be generated with the selected criteria.",
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const availability = manager.create(InterviewAvailabilityEntity, {
        id: newId(),
        interviewRoundId: roundId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        daysOfWeek: dto.daysOfWeek,
        timeWindows: dto.timeWindows,
        durationMinutes: duration,
        bufferMinutes: buffer,
        timezone: tz,
        createdById: actorUserId,
      });
      await manager.save(availability);

      const existingSlots = await manager.find(InterviewSlotEntity, {
        where: { interviewRoundId: roundId },
        select: { startAt: true },
      });
      const existingTimes = new Set(existingSlots.map((s) => s.startAt.getTime()));

      const slotEntities = slotsToCreate
        .filter((s) => !existingTimes.has(s.startAt.getTime()))
        .map((s) =>
          manager.create(InterviewSlotEntity, {
            id: newId(),
            interviewRoundId: roundId,
            startAt: s.startAt,
            endAt: s.endAt,
            timezone: s.timezone,
            status: InterviewSlotStatus.AVAILABLE,
          }),
        );

      if (slotEntities.length > 0) {
        await manager.save(InterviewSlotEntity, slotEntities);
      }

      await this.audit.record(
        {
          userId: actorUserId,
          action: "careers.interview_availability.generated",
          entityType: "interview_round",
          entityId: roundId,
          metadata: {
            availabilityId: availability.id,
            slotsGenerated: slotEntities.length,
            duration,
            buffer,
          },
        },
        manager,
      );

      return {
        availabilityId: availability.id,
        createdSlotsCount: slotEntities.length,
        totalSlotsAvailable: slotsToCreate.length,
      };
    });
  }

  async blockSlot(slotId: string, actorUserId: string) {
    const slot = await this.interviewSlots.findOne({
      where: { id: slotId },
      relations: { booking: true },
    });
    if (!slot) throw new NotFoundException("Slot not found.");
    if (slot.status === InterviewSlotStatus.BOOKED) {
      throw new BadRequestException(
        "Cannot block an already booked slot. Please cancel the booking first.",
      );
    }

    slot.status = InterviewSlotStatus.BLOCKED;
    await this.interviewSlots.save(slot);

    await this.audit.record({
      userId: actorUserId,
      action: "careers.interview_slot.blocked",
      entityType: "interview_slot",
      entityId: slot.id,
    });

    return slot;
  }

  async unblockSlot(slotId: string, actorUserId: string) {
    const slot = await this.interviewSlots.findOne({ where: { id: slotId } });
    if (!slot) throw new NotFoundException("Slot not found.");
    if (slot.status !== InterviewSlotStatus.BLOCKED) {
      throw new BadRequestException("Slot is not currently blocked.");
    }

    slot.status = InterviewSlotStatus.AVAILABLE;
    await this.interviewSlots.save(slot);

    await this.audit.record({
      userId: actorUserId,
      action: "careers.interview_slot.unblocked",
      entityType: "interview_slot",
      entityId: slot.id,
    });

    return slot;
  }

  async generateSchedulingToken(roundId: string, actorUserId: string) {
    const round = await this.interviewRounds.findOne({
      where: { id: roundId },
      relations: { application: true },
    });
    if (!round) throw new NotFoundException("Interview round not found.");

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

    const token = this.schedulingTokens.create({
      id: newId(),
      applicationId: round.applicationId,
      interviewRoundId: round.id,
      tokenHash,
      status: SchedulingTokenStatus.ACTIVE,
      expiresAt,
    });
    await this.schedulingTokens.save(token);

    if (round.status === InterviewRoundStatus.PENDING) {
      round.status = InterviewRoundStatus.INVITED;
      await this.interviewRounds.save(round);
    }

    const schedulingUrl = `${this.publicSiteUrl}/careers/interview/schedule/${token.id}`;

    await this.audit.record({
      userId: actorUserId,
      action: "careers.scheduling_token.generated",
      entityType: "scheduling_token",
      entityId: token.id,
      metadata: { roundId, applicationId: round.applicationId },
    });

    return {
      tokenId: token.id,
      rawToken,
      schedulingUrl,
      expiresAt: token.expiresAt,
    };
  }

  async revokeSchedulingToken(roundId: string, actorUserId: string) {
    const round = await this.interviewRounds.findOne({ where: { id: roundId } });
    if (!round) throw new NotFoundException("Interview round not found.");

    await this.schedulingTokens.update(
      { interviewRoundId: roundId, status: SchedulingTokenStatus.ACTIVE },
      { status: SchedulingTokenStatus.REVOKED },
    );

    if (round.status === InterviewRoundStatus.INVITED) {
      round.status = InterviewRoundStatus.PENDING;
      await this.interviewRounds.save(round);
    }

    await this.audit.record({
      userId: actorUserId,
      action: "careers.scheduling_token.revoked",
      entityType: "interview_round",
      entityId: roundId,
      metadata: { roundId, applicationId: round.applicationId },
    });

    return { success: true, message: "Scheduling link revoked successfully." };
  }

  async regenerateSchedulingToken(roundId: string, actorUserId: string) {
    await this.revokeSchedulingToken(roundId, actorUserId);
    return await this.generateSchedulingToken(roundId, actorUserId);
  }

  async sendShortlistInvite(roundId: string, actorUserId: string) {
    const round = await this.interviewRounds.findOne({
      where: { id: roundId },
      relations: { application: { job: true } },
    });
    if (!round) throw new NotFoundException("Interview round not found.");
    const app = round.application;
    if (!app) throw new NotFoundException("Application not found.");

    const { rawToken, schedulingUrl } = await this.generateSchedulingToken(
      roundId,
      actorUserId,
    );

    await this.mail.sendInterviewInvitation({
      candidateName: app.candidateName,
      candidateEmail: app.email,
      jobTitle: app.job?.title || "Role",
      jobCode: app.job?.jobCode || "",
      applicationCode: app.applicationCode,
      roundTitle: round.title,
      durationMinutes: round.durationMinutes,
      schedulingUrl,
    });

    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    await this.schedulingTokens.update({ tokenHash }, { sentAt: new Date() });

    await this.logActivity(this.applications.manager, {
      applicationId: app.id,
      action: ApplicationActivityType.INTERVIEW_INVITATION_SENT,
      description: `Interview invitation sent to candidate for ${round.title}`,
      oldStatus: null,
      newStatus: null,
      performedById: actorUserId,
      metadata: { roundId, schedulingUrl },
    });

    return {
      success: true,
      sentTo: app.email,
      schedulingUrl,
    };
  }

  async cancelBooking(
    bookingId: string,
    dto: CancelBookingDto,
    actorUserId: string,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(InterviewBookingEntity, {
        where: { id: bookingId },
        relations: {
          interviewSlot: true,
          interviewRound: true,
          application: true,
        },
      });
      if (!booking) throw new NotFoundException("Booking not found.");
      if (booking.status === InterviewBookingStatus.CANCELLED) {
        throw new BadRequestException("Booking is already cancelled.");
      }

      booking.status = InterviewBookingStatus.CANCELLED;
      if (dto.reason) {
        booking.notes = booking.notes
          ? `${booking.notes}\n[Cancelled]: ${dto.reason}`
          : `[Cancelled]: ${dto.reason}`;
      }
      await manager.save(booking);

      if (booking.interviewSlot) {
        booking.interviewSlot.status = InterviewSlotStatus.AVAILABLE;
        await manager.save(booking.interviewSlot);
      }

      if (booking.interviewRound) {
        booking.interviewRound.status = InterviewRoundStatus.PENDING;
        await manager.save(booking.interviewRound);
      }

      if (booking.application) {
        await this.logActivity(manager, {
          applicationId: booking.applicationId,
          action: ApplicationActivityType.INTERVIEW_CANCELLED,
          description: `Interview booking cancelled (${dto.reason || "No reason specified"})`,
          oldStatus: null,
          newStatus: null,
          performedById: actorUserId,
        });
      }

      return booking;
    });
  }

  async rescheduleBooking(
    bookingId: string,
    dto: RescheduleBookingDto,
    actorUserId: string,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const oldBooking = await manager.findOne(InterviewBookingEntity, {
        where: { id: bookingId },
        lock: { mode: "pessimistic_write" },
      });
      if (!oldBooking) throw new NotFoundException("Booking not found.");

      const [interviewSlot, interviewRound, application] = await Promise.all([
        oldBooking.interviewSlotId
          ? manager.findOne(InterviewSlotEntity, { where: { id: oldBooking.interviewSlotId } })
          : null,
        manager.findOne(InterviewRoundEntity, { where: { id: oldBooking.interviewRoundId } }),
        manager.findOne(JobApplicationEntity, { where: { id: oldBooking.applicationId } }),
      ]);
      oldBooking.interviewSlot = interviewSlot!;
      oldBooking.interviewRound = interviewRound!;
      oldBooking.application = application!;

      const newSlot = await manager.findOne(InterviewSlotEntity, {
        where: { id: dto.newSlotId, interviewRoundId: oldBooking.interviewRoundId },
        lock: { mode: "pessimistic_write" },
      });
      if (!newSlot || newSlot.status !== InterviewSlotStatus.AVAILABLE) {
        throw new ConflictException("The selected slot is no longer available.");
      }

      if (oldBooking.interviewSlot) {
        oldBooking.interviewSlot.status = InterviewSlotStatus.AVAILABLE;
        await manager.save(oldBooking.interviewSlot);
      }
      oldBooking.status = InterviewBookingStatus.RESCHEDULED;
      await manager.save(oldBooking);

      newSlot.status = InterviewSlotStatus.BOOKED;
      await manager.save(newSlot);

      const newBooking = manager.create(InterviewBookingEntity, {
        id: newId(),
        interviewSlotId: newSlot.id,
        interviewRoundId: oldBooking.interviewRoundId,
        applicationId: oldBooking.applicationId,
        status: InterviewBookingStatus.SCHEDULED,
        candidateTimezone: oldBooking.candidateTimezone,
        meetingLink: oldBooking.meetingLink || this.generateMeetingLink(),
        notes: dto.reason ? `[Rescheduled from ${oldBooking.id}]: ${dto.reason}` : null,
        bookedAt: new Date(),
      });
      await manager.save(newBooking);

      if (oldBooking.application) {
        await this.logActivity(manager, {
          applicationId: oldBooking.applicationId,
          action: ApplicationActivityType.INTERVIEW_RESCHEDULED,
          description: `Interview rescheduled to ${formatDateShort(newSlot.startAt, newBooking.candidateTimezone)}`,
          oldStatus: null,
          newStatus: null,
          performedById: actorUserId,
        });
      }

      return newBooking;
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Interview Scheduling — Public Candidate                                  */
  /* ------------------------------------------------------------------------ */

  async getPublicScheduleDetails(rawToken: string) {
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const token = await this.schedulingTokens.findOne({
      where: [{ tokenHash }, { id: rawToken }],
      relations: {
        application: { job: true },
        interviewRound: { slots: true },
      },
    });

    if (!token) {
      throw new NotFoundException("This scheduling link is invalid or no longer available.");
    }

    if (token.status === SchedulingTokenStatus.REVOKED) {
      throw new BadRequestException(
        "This scheduling link has been revoked. Please contact MarineCloudX for assistance.",
      );
    }

    if (token.status === SchedulingTokenStatus.EXPIRED || token.expiresAt < new Date()) {
      throw new BadRequestException(
        "This scheduling link has expired. Please contact MarineCloudX for a new scheduling link.",
      );
    }

    const app = token.application;
    const round = token.interviewRound;
    if (!app || !round) {
      throw new NotFoundException(
        "The requested application or interview round could not be found.",
      );
    }

    const existingBooking = await this.interviewBookings.findOne({
      where: {
        applicationId: app.id,
        interviewRoundId: round.id,
        status: InterviewBookingStatus.SCHEDULED,
      },
      relations: { interviewSlot: true },
    });

    if (existingBooking && existingBooking.interviewSlot) {
      const tz =
        existingBooking.candidateTimezone ||
        existingBooking.interviewSlot.timezone ||
        "Asia/Kolkata";

      const icsPayload = {
        bookingId: existingBooking.id,
        roundTitle: round.title,
        candidateName: app.candidateName,
        candidateEmail: app.email,
        jobTitle: app.job?.title || "Role",
        jobCode: app.job?.jobCode,
        applicationCode: app.applicationCode,
        startAt: existingBooking.interviewSlot.startAt,
        endAt: existingBooking.interviewSlot.endAt,
        timezone: tz,
        meetingLink: existingBooking.meetingLink,
        notes: existingBooking.notes,
      };

      const icsContent = this.ics.generateICS(icsPayload);
      const googleCalendarUrl = this.ics.generateGoogleCalendarUrl(icsPayload);

      return {
        alreadyBooked: true,
        booking: {
          id: existingBooking.id,
          date: formatDateLong(existingBooking.interviewSlot.startAt, tz),
          time: formatTimeRange(
            existingBooking.interviewSlot.startAt,
            existingBooking.interviewSlot.endAt,
            tz,
          ),
          timezone: tz,
          meetingLink: existingBooking.meetingLink,
          googleCalendarUrl,
          icsContent,
        },
        candidate: {
          name: app.candidateName,
          email: app.email,
          applicationCode: app.applicationCode,
        },
        job: {
          title: app.job?.title || "Role",
          department: app.job?.department,
          location: app.job?.location,
        },
        round: {
          title: round.title,
          durationMinutes: round.durationMinutes,
        },
        availableDates: [],
        timezone: tz,
      };
    }

    const now = new Date();
    const availableSlots = (round.slots ?? []).filter(
      (s) =>
        s.status === InterviewSlotStatus.AVAILABLE &&
        new Date(s.startAt).getTime() > now.getTime(),
    );

    const tz = "Asia/Kolkata";
    const availableDatesSet = new Set<string>();
    for (const slot of availableSlots) {
      const slotTz = slot.timezone || tz;
      const dStr = formatIsoDate(slot.startAt, slotTz);
      availableDatesSet.add(dStr);
    }

    const availableDates = Array.from(availableDatesSet).sort();

    return {
      alreadyBooked: false,
      booking: null,
      candidate: {
        name: app.candidateName,
        email: app.email,
        applicationCode: app.applicationCode,
      },
      job: {
        title: app.job?.title || "Role",
        department: app.job?.department,
        location: app.job?.location,
      },
      round: {
        title: round.title,
        durationMinutes: round.durationMinutes,
      },
      availableDates,
      timezone: tz,
    };
  }

  async getPublicAvailableSlots(rawToken: string, date: string) {
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const token = await this.schedulingTokens.findOne({
      where: [{ tokenHash }, { id: rawToken }],
      relations: { interviewRound: true },
    });

    if (
      !token ||
      token.status !== SchedulingTokenStatus.ACTIVE ||
      token.expiresAt < new Date()
    ) {
      throw new NotFoundException("This scheduling link is invalid or no longer active.");
    }

    const now = new Date();
    const slots = await this.interviewSlots.find({
      where: {
        interviewRoundId: token.interviewRoundId,
        status: InterviewSlotStatus.AVAILABLE,
      },
      order: { startAt: "ASC" },
    });

    const matchingSlots = slots
      .filter((s) => {
        if (new Date(s.startAt).getTime() <= now.getTime()) return false;
        const tz = s.timezone || "Asia/Kolkata";
        return formatIsoDate(s.startAt, tz) === date;
      })
      .map((s) => {
        const tz = s.timezone || "Asia/Kolkata";
        return {
          id: s.id,
          startAt: s.startAt,
          endAt: s.endAt,
          timezone: tz,
          formattedTime: formatTimeShort(s.startAt, tz),
          formattedEndTime: formatTimeShort(s.endAt, tz),
        };
      });

    return matchingSlots;
  }

  async bookSlot(rawToken: string, dto: BookSlotDto) {
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    const result = await this.dataSource.transaction(async (manager) => {
      const token = await manager.findOne(SchedulingTokenEntity, {
        where: [{ tokenHash }, { id: rawToken }],
        lock: { mode: "pessimistic_write" },
      });

      if (!token) {
        throw new NotFoundException(
          "This scheduling link is invalid or no longer available.",
        );
      }

      const [application, interviewRound] = await Promise.all([
        manager.findOne(JobApplicationEntity, {
          where: { id: token.applicationId },
          relations: { job: true },
        }),
        manager.findOne(InterviewRoundEntity, {
          where: { id: token.interviewRoundId },
        }),
      ]);

      token.application = application!;
      token.interviewRound = interviewRound!;

      if (token.status === SchedulingTokenStatus.REVOKED) {
        throw new BadRequestException(
          "This scheduling link has been revoked. Please contact MarineCloudX.",
        );
      }

      if (token.status === SchedulingTokenStatus.EXPIRED || token.expiresAt < new Date()) {
        throw new BadRequestException(
          "This scheduling link has expired. Please contact MarineCloudX for a new link.",
        );
      }

      if (token.status === SchedulingTokenStatus.USED) {
        throw new BadRequestException(
          "This scheduling link has already been used to schedule an interview.",
        );
      }

      const slot = await manager.findOne(InterviewSlotEntity, {
        where: { id: dto.slotId, interviewRoundId: token.interviewRoundId },
        lock: { mode: "pessimistic_write" },
      });

      if (!slot || slot.status !== InterviewSlotStatus.AVAILABLE) {
        throw new ConflictException(
          "This time slot is no longer available. Please select another available time.",
        );
      }

      if (slot.startAt <= new Date()) {
        throw new ConflictException(
          "This time slot is in the past. Please select an upcoming available time.",
        );
      }

      const existing = await manager.findOne(InterviewBookingEntity, {
        where: {
          applicationId: token.applicationId,
          interviewRoundId: token.interviewRoundId,
          status: InterviewBookingStatus.SCHEDULED,
        },
      });

      if (existing) {
        throw new ConflictException(
          "You already have an active scheduled interview for this round.",
        );
      }

      slot.status = InterviewSlotStatus.BOOKED;
      await manager.save(slot);

      const meetingLink =
        token.interviewRound?.meetingLink ||
        this.generateMeetingLink(token.application?.candidateName, token.interviewRound?.roundNumber);
      const booking = manager.create(InterviewBookingEntity, {
        id: newId(),
        interviewSlotId: slot.id,
        interviewRoundId: token.interviewRoundId,
        applicationId: token.applicationId,
        status: InterviewBookingStatus.SCHEDULED,
        candidateTimezone: dto.timezone || slot.timezone || "Asia/Kolkata",
        meetingLink,
        notes: dto.notes ? dto.notes.trim() : null,
        bookedAt: new Date(),
      });
      await manager.save(booking);

      token.status = SchedulingTokenStatus.USED;
      token.usedAt = new Date();
      await manager.save(token);

      const round = token.interviewRound;
      if (round) {
        round.status = InterviewRoundStatus.SCHEDULED;
        await manager.save(round);
      }

      const app = token.application;
      if (app && app.status !== ApplicationStatus.SELECTED) {
        const oldStatus = app.status;
        app.status = ApplicationStatus.INTERVIEW;
        await manager.save(app);

        const activity = manager.create(ApplicationActivityEntity, {
          id: newId(),
          applicationId: app.id,
          action: ApplicationActivityType.INTERVIEW_SCHEDULED,
          description: `Interview scheduled for ${round?.title || "Round"} (${formatDateShort(slot.startAt, booking.candidateTimezone)})`,
          oldStatus: oldStatus !== ApplicationStatus.INTERVIEW ? oldStatus : null,
          newStatus: ApplicationStatus.INTERVIEW,
          performedById: null,
          metadata: {
            bookingId: booking.id,
            slotId: slot.id,
            roundId: round?.id,
            startAt: slot.startAt,
            endAt: slot.endAt,
            timezone: booking.candidateTimezone,
          },
        });
        await manager.save(activity);
      }

      return {
        booking,
        slot,
        round,
        application: app,
      };
    });

    const tz = result.booking.candidateTimezone;
    const formattedDate = formatDateLong(result.slot.startAt, tz);
    const formattedTime = formatTimeRange(result.slot.startAt, result.slot.endAt, tz);

    const icsPayload = {
      bookingId: result.booking.id,
      roundTitle: result.round?.title || "Interview",
      candidateName: result.application?.candidateName || "Candidate",
      candidateEmail: result.application?.email,
      jobTitle: result.application?.job?.title || "Role",
      jobCode: result.application?.job?.jobCode,
      applicationCode: result.application?.applicationCode,
      startAt: result.slot.startAt,
      endAt: result.slot.endAt,
      timezone: tz,
      meetingLink: result.booking.meetingLink,
      notes: result.booking.notes,
    };

    const icsContent = this.ics.generateICS(icsPayload);
    const googleCalendarUrl = this.ics.generateGoogleCalendarUrl(icsPayload);

    if (result.application) {
      this.mail.sendInterviewConfirmation({
        candidateName: result.application.candidateName,
        candidateEmail: result.application.email,
        jobTitle: result.application.job?.title || "Role",
        jobCode: result.application.job?.jobCode || "",
        applicationCode: result.application.applicationCode,
        roundTitle: result.round?.title || "Interview",
        durationMinutes: result.round?.durationMinutes || 30,
        formattedDate,
        formattedTime,
        timezone: `${tz} (${getTimezoneAbbr(result.slot.startAt, tz)})`,
        meetingLink: result.booking.meetingLink,
        icsContent,
      });

      this.mail.sendInterviewAdminAlert({
        candidateName: result.application.candidateName,
        candidateEmail: result.application.email,
        jobTitle: result.application.job?.title || "Role",
        applicationCode: result.application.applicationCode,
        roundTitle: result.round?.title || "Interview",
        durationMinutes: result.round?.durationMinutes || 30,
        formattedDate,
        formattedTime,
        timezone: tz,
        meetingLink: result.booking.meetingLink,
        icsContent,
      });
    }

    return {
      bookingId: result.booking.id,
      applicationCode: result.application?.applicationCode,
      candidateName: result.application?.candidateName,
      jobTitle: result.application?.job?.title,
      roundTitle: result.round?.title,
      durationMinutes: result.round?.durationMinutes,
      startAt: result.slot.startAt,
      endAt: result.slot.endAt,
      formattedDate,
      formattedTime,
      timezone: tz,
      meetingLink: result.booking.meetingLink,
      googleCalendarUrl,
      icsContent,
    };
  }

  async downloadBookingIcs(rawToken: string): Promise<string> {
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const token = await this.schedulingTokens.findOne({
      where: [{ tokenHash }, { id: rawToken }],
      relations: {
        application: { job: true },
        interviewRound: true,
      },
    });
    if (!token) throw new NotFoundException("Invalid or expired scheduling token.");

    const booking = await this.interviewBookings.findOne({
      where: {
        applicationId: token.applicationId,
        interviewRoundId: token.interviewRoundId,
        status: InterviewBookingStatus.SCHEDULED,
      },
      relations: { interviewSlot: true },
    });

    if (!booking || !booking.interviewSlot) {
      throw new NotFoundException("No confirmed booking found for this interview round.");
    }

    const tz = booking.candidateTimezone || booking.interviewSlot.timezone || "Asia/Kolkata";
    return this.ics.generateICS({
      bookingId: booking.id,
      roundTitle: token.interviewRound?.title || "Interview",
      candidateName: token.application?.candidateName || "Candidate",
      candidateEmail: token.application?.email,
      jobTitle: token.application?.job?.title || "Role",
      jobCode: token.application?.job?.jobCode,
      applicationCode: token.application?.applicationCode,
      startAt: booking.interviewSlot.startAt,
      endAt: booking.interviewSlot.endAt,
      timezone: tz,
      meetingLink: booking.meetingLink,
      notes: booking.notes,
    });
  }

  private serializeInterviewRound(r: InterviewRoundEntity) {
    const slots = r.slots ?? [];
    const totalSlots = slots.length;
    const availableSlots = slots.filter((s) => s.status === InterviewSlotStatus.AVAILABLE).length;
    const bookedSlots = slots.filter((s) => s.status === InterviewSlotStatus.BOOKED).length;
    const blockedSlots = slots.filter((s) => s.status === InterviewSlotStatus.BLOCKED).length;

    const activeToken = (r.tokens ?? [])
      .filter(
        (t) =>
          t.status === SchedulingTokenStatus.ACTIVE &&
          new Date(t.expiresAt).getTime() > Date.now(),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    const latestBooking = (r.bookings ?? [])
      .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())[0];

    return {
      id: r.id,
      applicationId: r.applicationId,
      roundNumber: r.roundNumber,
      title: r.title,
      durationMinutes: r.durationMinutes,
      status: r.status,
      notes: r.notes,
      meetingLink: r.meetingLink ?? latestBooking?.meetingLink ?? null,
      createdAt: r.createdAt,
      stats: {
        totalSlots,
        availableSlots,
        bookedSlots,
        blockedSlots,
      },
      availabilities: r.availabilities ?? [],
      slots: slots.map((s) => ({
        id: s.id,
        startAt: s.startAt,
        endAt: s.endAt,
        timezone: s.timezone,
        status: s.status,
        booking: s.booking
          ? {
              id: s.booking.id,
              status: s.booking.status,
              candidateTimezone: s.booking.candidateTimezone,
              notes: s.booking.notes,
              meetingLink: s.booking.meetingLink,
              bookedAt: s.booking.bookedAt,
            }
          : null,
      })),
      latestBooking: latestBooking
        ? {
            id: latestBooking.id,
            status: latestBooking.status,
            bookedAt: latestBooking.bookedAt,
            candidateTimezone: latestBooking.candidateTimezone,
            notes: latestBooking.notes,
            meetingLink: latestBooking.meetingLink,
            slot: latestBooking.interviewSlot
              ? {
                  id: latestBooking.interviewSlot.id,
                  startAt: latestBooking.interviewSlot.startAt,
                  endAt: latestBooking.interviewSlot.endAt,
                  timezone: latestBooking.interviewSlot.timezone,
                }
              : null,
          }
        : null,
      activeToken: activeToken
        ? {
            id: activeToken.id,
            schedulingUrl: `${this.publicSiteUrl}/careers/interview/schedule/${activeToken.id}`,
            expiresAt: activeToken.expiresAt,
            sentAt: activeToken.sentAt,
            status: activeToken.status,
          }
        : null,
    };
  }

  private generateMeetingLink(candidateName?: string, roundNumber?: number): string {
    if (process.env.DEFAULT_GOOGLE_MEET_URL) {
      return process.env.DEFAULT_GOOGLE_MEET_URL.trim();
    }
    // Instant, 100% working video room (no login, no account, zero failure)
    const safeName = (candidateName || "Candidate")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 15);
    const randPart = randomBytes(4).toString("hex");
    return `https://meet.jit.si/MCX-Interview-${safeName}-R${roundNumber || 1}-${randPart}`;
  }

  private get publicSiteUrl(): string {
    return (
      process.env.PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://marinecloudx.in"
        : "http://localhost:3000")
    ).replace(/\/+$/, "");
  }
}

function parseZonedDateTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`;
  const initialDate = new Date(dateStr);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(initialDate);
  const getPart = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);

  const tzYear = getPart("year");
  const tzMonth = getPart("month");
  const tzDay = getPart("day");
  let tzHour = getPart("hour");
  if (tzHour === 24) tzHour = 0;
  const tzMinute = getPart("minute");

  const tzDateAsUtc = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute, 0);
  const diffMs = tzDateAsUtc - initialDate.getTime();
  return new Date(initialDate.getTime() - diffMs);
}

function formatIsoDate(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}

function formatTimeShort(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatDateLong(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatDateShort(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatTimeRange(startAt: Date, endAt: Date, timeZone: string): string {
  return `${formatTimeShort(startAt, timeZone)} – ${formatTimeShort(endAt, timeZone)}`;
}

function getTimezoneAbbr(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short",
  }).formatToParts(date);
  return parts.find((p) => p.type === "timeZoneName")?.value || timeZone;
}


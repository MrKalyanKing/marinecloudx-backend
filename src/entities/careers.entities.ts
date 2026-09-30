import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";

import {
  ApplicationActivityType,
  ApplicationSource,
  ApplicationStatus,
  EmploymentType,
  JobStatus,
} from "../contracts";
import { BaseIdEntity, BaseMutableEntity } from "./_shared/primary-id";
import { decimalTransformer } from "./_shared/transformers";
import type { UserEntity } from "./auth.entities";

/**
 * Careers — job postings and candidate applications.
 * Resume binary data lives in private S3; only metadata is stored here.
 */

@Index("Job_status_idx", ["status"])
@Index("Job_createdAt_idx", ["createdAt"])
@Index("Job_slug_key", ["slug"], { unique: true })
@Index("Job_jobCode_key", ["jobCode"], { unique: true })
@Entity({ name: "Job" })
export class JobEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  title!: string;

  @Column({ type: "text" })
  slug!: string;

  /** Human-readable job ID, e.g. MCX-2026-0007. */
  @Column({ type: "text" })
  jobCode!: string;

  @Column({ type: "text", nullable: true })
  department!: string | null;

  @Column({ type: "text", nullable: true })
  location!: string | null;

  @Column({
    type: "enum",
    enum: EmploymentType,
    enumName: "EmploymentType",
    default: EmploymentType.FULL_TIME,
  })
  employmentType!: EmploymentType;

  @Column({ type: "text", nullable: true })
  experience!: string | null;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "text", nullable: true })
  responsibilities!: string | null;

  @Column({ type: "text", nullable: true })
  requirements!: string | null;

  @Column({ type: "text", nullable: true })
  niceToHave!: string | null;

  @Column({ type: "text", nullable: true })
  salaryRange!: string | null;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  applicationDeadline!: Date | null;

  @Column({ type: "enum", enum: JobStatus, enumName: "JobStatus", default: JobStatus.DRAFT })
  status!: JobStatus;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  publishedAt!: Date | null;

  @OneToMany("JobApplication", "job")
  applications?: JobApplicationEntity[];
}

@Index("JobApplication_jobId_idx", ["jobId"])
@Index("JobApplication_status_idx", ["status"])
@Index("JobApplication_email_idx", ["email"])
@Index("JobApplication_createdAt_idx", ["createdAt"])
@Index("JobApplication_jobId_status_createdAt_idx", ["jobId", "status", "createdAt"])
@Index("JobApplication_applicationCode_key", ["applicationCode"], { unique: true })
@Entity({ name: "JobApplication" })
export class JobApplicationEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  jobId!: string;

  @ManyToOne("Job", "applications", { onDelete: "RESTRICT", onUpdate: "CASCADE" })
  @JoinColumn({ name: "jobId" })
  job?: JobEntity;

  /** Human-readable application ID, e.g. MCX-APP-2026-000124. */
  @Column({ type: "text" })
  applicationCode!: string;

  @Column({ type: "text" })
  candidateName!: string;

  @Column({ type: "text" })
  email!: string;

  @Column({ type: "text", nullable: true })
  phone!: string | null;

  @Column({ type: "text", nullable: true })
  location!: string | null;

  @Column({ type: "text", nullable: true })
  linkedinUrl!: string | null;

  @Column({ type: "text", nullable: true })
  githubUrl!: string | null;

  @Column({ type: "text", nullable: true })
  portfolioUrl!: string | null;

  @Column({ type: "text", nullable: true })
  currentJobTitle!: string | null;

  @Column({
    type: "numeric",
    precision: 4,
    scale: 1,
    nullable: true,
    transformer: decimalTransformer,
  })
  yearsOfExperience!: number | null;

  @Column({ type: "text", nullable: true })
  summary!: string | null;

  /** Flat list of skill labels for filtering/display. */
  @Column({ type: "jsonb", default: [] })
  skills!: string[];

  /** Structured education entries (JSON). */
  @Column({ type: "jsonb", default: [] })
  education!: EducationEntry[];

  /** Structured work experience entries (JSON). */
  @Column({ type: "jsonb", default: [] })
  workExperience!: WorkExperienceEntry[];

  @Column({ type: "text", nullable: true })
  coverLetter!: string | null;

  @Column({ type: "text", nullable: true })
  noticePeriod!: string | null;

  @Column({ type: "text", nullable: true })
  currentCtc!: string | null;

  @Column({ type: "text", nullable: true })
  expectedCtc!: string | null;

  @Column({
    type: "enum",
    enum: ApplicationSource,
    enumName: "ApplicationSource",
    default: ApplicationSource.CAREERS_PAGE,
  })
  applicationSource!: ApplicationSource;

  @Column({ type: "text", nullable: true })
  resumeKey!: string | null;

  @Column({ type: "text", nullable: true })
  resumeFileName!: string | null;

  @Column({ type: "text", nullable: true })
  resumeMimeType!: string | null;

  @Column({ type: "int", nullable: true })
  resumeSize!: number | null;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  resumeUploadedAt!: Date | null;

  @Column({
    type: "enum",
    enum: ApplicationStatus,
    enumName: "ApplicationStatus",
    default: ApplicationStatus.NEW,
  })
  status!: ApplicationStatus;

  @OneToMany("ApplicationActivity", "application")
  activities?: ApplicationActivityEntity[];
}

export interface EducationEntry {
  institution?: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface WorkExperienceEntry {
  company?: string;
  position?: string;
  startDate?: string;
  endDate?: string | null;
  description?: string;
  isCurrent?: boolean;
}

@Index("ApplicationActivity_applicationId_createdAt_idx", ["applicationId", "createdAt"])
@Index("ApplicationActivity_performedById_idx", ["performedById"])
@Entity({ name: "ApplicationActivity" })
export class ApplicationActivityEntity extends BaseIdEntity {
  @Column({ type: "text" })
  applicationId!: string;

  @ManyToOne("JobApplication", "activities", { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "applicationId" })
  application?: JobApplicationEntity;

  @Column({
    type: "enum",
    enum: ApplicationActivityType,
    enumName: "ApplicationActivityType",
  })
  action!: ApplicationActivityType;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({
    type: "enum",
    enum: ApplicationStatus,
    enumName: "ApplicationStatus",
    nullable: true,
  })
  oldStatus!: ApplicationStatus | null;

  @Column({
    type: "enum",
    enum: ApplicationStatus,
    enumName: "ApplicationStatus",
    nullable: true,
  })
  newStatus!: ApplicationStatus | null;

  /** Null for system-generated events (e.g. application received). */
  @Column({ type: "text", nullable: true })
  performedById!: string | null;

  @ManyToOne("User", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "performedById" })
  performedBy?: UserEntity | null;

  @Column({ type: "jsonb", nullable: true })
  metadata!: Record<string, unknown> | null;
}

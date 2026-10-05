import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";

import {
  ApplicationActivityType,
  ApplicationSource,
  ApplicationStatus,
  EmploymentType,
  JobStatus,
  InterviewRoundStatus,
  InterviewSlotStatus,
  InterviewBookingStatus,
  SchedulingTokenStatus,
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

  @OneToMany("InterviewRound", "application")
  interviewRounds?: InterviewRoundEntity[];
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

export interface TimeWindowEntry {
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

@Index("InterviewRound_applicationId_idx", ["applicationId"])
@Entity({ name: "InterviewRound" })
export class InterviewRoundEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  applicationId!: string;

  @ManyToOne("JobApplication", "interviewRounds", { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "applicationId" })
  application?: JobApplicationEntity;

  @Column({ type: "int", default: 1 })
  roundNumber!: number;

  @Column({ type: "text" })
  title!: string;

  @Column({ type: "int", default: 30 })
  durationMinutes!: number;

  @Column({
    type: "enum",
    enum: InterviewRoundStatus,
    enumName: "InterviewRoundStatus",
    default: InterviewRoundStatus.PENDING,
  })
  status!: InterviewRoundStatus;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ type: "text", nullable: true })
  meetingLink!: string | null;

  @OneToMany("InterviewAvailability", "interviewRound")
  availabilities?: InterviewAvailabilityEntity[];

  @OneToMany("InterviewSlot", "interviewRound")
  slots?: InterviewSlotEntity[];

  @OneToMany("InterviewBooking", "interviewRound")
  bookings?: InterviewBookingEntity[];

  @OneToMany("SchedulingToken", "interviewRound")
  tokens?: SchedulingTokenEntity[];
}

@Index("InterviewAvailability_interviewRoundId_idx", ["interviewRoundId"])
@Entity({ name: "InterviewAvailability" })
export class InterviewAvailabilityEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  interviewRoundId!: string;

  @ManyToOne("InterviewRound", "availabilities", { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "interviewRoundId" })
  interviewRound?: InterviewRoundEntity;

  @Column({ type: "date" })
  startDate!: string;

  @Column({ type: "date" })
  endDate!: string;

  @Column({ type: "jsonb", default: [] })
  daysOfWeek!: string[];

  @Column({ type: "jsonb", default: [] })
  timeWindows!: TimeWindowEntry[];

  @Column({ type: "int" })
  durationMinutes!: number;

  @Column({ type: "int", default: 0 })
  bufferMinutes!: number;

  @Column({ type: "text", default: "Asia/Kolkata" })
  timezone!: string;

  @Column({ type: "text", nullable: true })
  createdById!: string | null;

  @ManyToOne("User", { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: "createdById" })
  createdBy?: UserEntity | null;
}

@Index("InterviewSlot_interviewRoundId_startAt_idx", ["interviewRoundId", "startAt"])
@Index("InterviewSlot_status_startAt_idx", ["status", "startAt"])
@Entity({ name: "InterviewSlot" })
export class InterviewSlotEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  interviewRoundId!: string;

  @ManyToOne("InterviewRound", "slots", { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "interviewRoundId" })
  interviewRound?: InterviewRoundEntity;

  @Column({ type: "timestamptz", precision: 6 })
  startAt!: Date;

  @Column({ type: "timestamptz", precision: 6 })
  endAt!: Date;

  @Column({ type: "text", default: "Asia/Kolkata" })
  timezone!: string;

  @Column({
    type: "enum",
    enum: InterviewSlotStatus,
    enumName: "InterviewSlotStatus",
    default: InterviewSlotStatus.AVAILABLE,
  })
  status!: InterviewSlotStatus;

  @OneToOne("InterviewBooking", "interviewSlot")
  booking?: InterviewBookingEntity | null;
}

@Index("InterviewBooking_interviewSlotId_key", ["interviewSlotId"], { unique: true })
@Index("InterviewBooking_applicationId_idx", ["applicationId"])
@Index("InterviewBooking_interviewRoundId_idx", ["interviewRoundId"])
@Entity({ name: "InterviewBooking" })
export class InterviewBookingEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  interviewSlotId!: string;

  @OneToOne("InterviewSlot", "booking", { onDelete: "RESTRICT", onUpdate: "CASCADE" })
  @JoinColumn({ name: "interviewSlotId" })
  interviewSlot?: InterviewSlotEntity | null;

  @Column({ type: "text" })
  interviewRoundId!: string;

  @ManyToOne("InterviewRound", "bookings", { onDelete: "RESTRICT", onUpdate: "CASCADE" })
  @JoinColumn({ name: "interviewRoundId" })
  interviewRound?: InterviewRoundEntity;

  @Column({ type: "text" })
  applicationId!: string;

  @ManyToOne("JobApplication", { onDelete: "RESTRICT", onUpdate: "CASCADE" })
  @JoinColumn({ name: "applicationId" })
  application?: JobApplicationEntity;

  @Column({
    type: "enum",
    enum: InterviewBookingStatus,
    enumName: "InterviewBookingStatus",
    default: InterviewBookingStatus.SCHEDULED,
  })
  status!: InterviewBookingStatus;

  @Column({ type: "timestamptz", precision: 6, default: () => "CURRENT_TIMESTAMP" })
  bookedAt!: Date;

  @Column({ type: "text", default: "Asia/Kolkata" })
  candidateTimezone!: string;

  @Column({ type: "text", nullable: true })
  meetingLink!: string | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;
}

@Index("SchedulingToken_tokenHash_key", ["tokenHash"], { unique: true })
@Index("SchedulingToken_applicationId_idx", ["applicationId"])
@Index("SchedulingToken_interviewRoundId_idx", ["interviewRoundId"])
@Entity({ name: "SchedulingToken" })
export class SchedulingTokenEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  applicationId!: string;

  @ManyToOne("JobApplication", { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "applicationId" })
  application?: JobApplicationEntity;

  @Column({ type: "text" })
  interviewRoundId!: string;

  @ManyToOne("InterviewRound", "tokens", { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "interviewRoundId" })
  interviewRound?: InterviewRoundEntity;

  @Column({ type: "text" })
  tokenHash!: string;

  @Column({
    type: "enum",
    enum: SchedulingTokenStatus,
    enumName: "SchedulingTokenStatus",
    default: SchedulingTokenStatus.ACTIVE,
  })
  status!: SchedulingTokenStatus;

  @Column({ type: "timestamptz", precision: 6 })
  expiresAt!: Date;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  usedAt!: Date | null;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  sentAt!: Date | null;
}


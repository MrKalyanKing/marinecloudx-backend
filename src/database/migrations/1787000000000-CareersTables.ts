import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Careers Application Management — Job, JobApplication, ApplicationActivity.
 */
export class CareersTables1787000000000 implements MigrationInterface {
  name = "CareersTables1787000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "EmploymentType" AS ENUM (
        'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "JobStatus" AS ENUM (
        'DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "ApplicationStatus" AS ENUM (
        'NEW', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "ApplicationSource" AS ENUM (
        'RESUME_UPLOAD', 'MANUAL_APPLICATION', 'CAREERS_PAGE', 'LINKEDIN'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "ApplicationActivityType" AS ENUM (
        'APPLICATION_RECEIVED', 'STATUS_CHANGED', 'RESUME_UPLOADED',
        'NOTE_ADDED', 'INTERVIEW_SCHEDULED', 'OTHER'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "Job" (
        "id" text NOT NULL,
        "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ(6) NOT NULL,
        "title" text NOT NULL,
        "slug" text NOT NULL,
        "department" text,
        "location" text,
        "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
        "experience" text,
        "description" text NOT NULL,
        "responsibilities" text,
        "requirements" text,
        "niceToHave" text,
        "salaryRange" text,
        "applicationDeadline" TIMESTAMPTZ(6),
        "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
        "publishedAt" TIMESTAMPTZ(6),
        CONSTRAINT "PK_Job" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "Job_slug_key" ON "Job" ("slug")`);
    await queryRunner.query(`CREATE INDEX "Job_status_idx" ON "Job" ("status")`);
    await queryRunner.query(`CREATE INDEX "Job_createdAt_idx" ON "Job" ("createdAt")`);

    await queryRunner.query(`
      CREATE TABLE "JobApplication" (
        "id" text NOT NULL,
        "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ(6) NOT NULL,
        "jobId" text NOT NULL,
        "candidateName" text NOT NULL,
        "email" text NOT NULL,
        "phone" text,
        "location" text,
        "linkedinUrl" text,
        "githubUrl" text,
        "portfolioUrl" text,
        "currentJobTitle" text,
        "yearsOfExperience" numeric(4,1),
        "summary" text,
        "skills" jsonb NOT NULL DEFAULT '[]',
        "education" jsonb NOT NULL DEFAULT '[]',
        "workExperience" jsonb NOT NULL DEFAULT '[]',
        "coverLetter" text,
        "noticePeriod" text,
        "currentCtc" text,
        "expectedCtc" text,
        "applicationSource" "ApplicationSource" NOT NULL DEFAULT 'CAREERS_PAGE',
        "resumeKey" text,
        "resumeFileName" text,
        "resumeMimeType" text,
        "resumeSize" integer,
        "resumeUploadedAt" TIMESTAMPTZ(6),
        "status" "ApplicationStatus" NOT NULL DEFAULT 'NEW',
        CONSTRAINT "PK_JobApplication" PRIMARY KEY ("id"),
        CONSTRAINT "FK_JobApplication_jobId" FOREIGN KEY ("jobId")
          REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "JobApplication_jobId_idx" ON "JobApplication" ("jobId")`);
    await queryRunner.query(`CREATE INDEX "JobApplication_status_idx" ON "JobApplication" ("status")`);
    await queryRunner.query(`CREATE INDEX "JobApplication_email_idx" ON "JobApplication" ("email")`);
    await queryRunner.query(`CREATE INDEX "JobApplication_createdAt_idx" ON "JobApplication" ("createdAt")`);
    await queryRunner.query(`
      CREATE INDEX "JobApplication_jobId_status_createdAt_idx"
      ON "JobApplication" ("jobId", "status", "createdAt")
    `);

    await queryRunner.query(`
      CREATE TABLE "ApplicationActivity" (
        "id" text NOT NULL,
        "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "applicationId" text NOT NULL,
        "action" "ApplicationActivityType" NOT NULL,
        "description" text,
        "oldStatus" "ApplicationStatus",
        "newStatus" "ApplicationStatus",
        "performedById" text,
        "metadata" jsonb,
        CONSTRAINT "PK_ApplicationActivity" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ApplicationActivity_applicationId" FOREIGN KEY ("applicationId")
          REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_ApplicationActivity_performedById" FOREIGN KEY ("performedById")
          REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "ApplicationActivity_applicationId_createdAt_idx"
      ON "ApplicationActivity" ("applicationId", "createdAt")
    `);
    await queryRunner.query(`
      CREATE INDEX "ApplicationActivity_performedById_idx"
      ON "ApplicationActivity" ("performedById")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "ApplicationActivity"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "JobApplication"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Job"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ApplicationActivityType"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ApplicationSource"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ApplicationStatus"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "JobStatus"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "EmploymentType"`);
  }
}

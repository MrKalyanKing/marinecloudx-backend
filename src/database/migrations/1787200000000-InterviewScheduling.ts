import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Interview Scheduling:
 *   InterviewRound, InterviewAvailability, InterviewSlot, InterviewBooking, SchedulingToken.
 */
export class InterviewScheduling1787200000000 implements MigrationInterface {
  name = "InterviewScheduling1787200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "InterviewRoundStatus" AS ENUM (
        'PENDING', 'INVITED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "InterviewSlotStatus" AS ENUM (
        'AVAILABLE', 'BOOKED', 'BLOCKED', 'CANCELLED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "InterviewBookingStatus" AS ENUM (
        'SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "SchedulingTokenStatus" AS ENUM (
        'ACTIVE', 'USED', 'EXPIRED', 'REVOKED'
      )
    `);

    // Extend ApplicationActivityType enum if values do not exist
    await queryRunner.query(`ALTER TYPE "ApplicationActivityType" ADD VALUE IF NOT EXISTS 'INTERVIEW_INVITATION_SENT'`);
    await queryRunner.query(`ALTER TYPE "ApplicationActivityType" ADD VALUE IF NOT EXISTS 'INTERVIEW_RESCHEDULED'`);
    await queryRunner.query(`ALTER TYPE "ApplicationActivityType" ADD VALUE IF NOT EXISTS 'INTERVIEW_CANCELLED'`);

    await queryRunner.query(`
      CREATE TABLE "InterviewRound" (
        "id" text NOT NULL,
        "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "applicationId" text NOT NULL,
        "roundNumber" integer NOT NULL DEFAULT 1,
        "title" text NOT NULL,
        "durationMinutes" integer NOT NULL DEFAULT 30,
        "status" "InterviewRoundStatus" NOT NULL DEFAULT 'PENDING',
        "notes" text,
        "meetingLink" text,
        CONSTRAINT "PK_InterviewRound" PRIMARY KEY ("id"),
        CONSTRAINT "FK_InterviewRound_applicationId" FOREIGN KEY ("applicationId")
          REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "InterviewRound_applicationId_idx" ON "InterviewRound" ("applicationId")`);

    await queryRunner.query(`
      CREATE TABLE "InterviewAvailability" (
        "id" text NOT NULL,
        "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "interviewRoundId" text NOT NULL,
        "startDate" date NOT NULL,
        "endDate" date NOT NULL,
        "daysOfWeek" jsonb NOT NULL DEFAULT '[]',
        "timeWindows" jsonb NOT NULL DEFAULT '[]',
        "durationMinutes" integer NOT NULL,
        "bufferMinutes" integer NOT NULL DEFAULT 0,
        "timezone" text NOT NULL DEFAULT 'Asia/Kolkata',
        "createdById" text,
        CONSTRAINT "PK_InterviewAvailability" PRIMARY KEY ("id"),
        CONSTRAINT "FK_InterviewAvailability_interviewRoundId" FOREIGN KEY ("interviewRoundId")
          REFERENCES "InterviewRound"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_InterviewAvailability_createdById" FOREIGN KEY ("createdById")
          REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "InterviewAvailability_interviewRoundId_idx" ON "InterviewAvailability" ("interviewRoundId")`);

    await queryRunner.query(`
      CREATE TABLE "InterviewSlot" (
        "id" text NOT NULL,
        "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "interviewRoundId" text NOT NULL,
        "startAt" TIMESTAMPTZ(6) NOT NULL,
        "endAt" TIMESTAMPTZ(6) NOT NULL,
        "timezone" text NOT NULL DEFAULT 'Asia/Kolkata',
        "status" "InterviewSlotStatus" NOT NULL DEFAULT 'AVAILABLE',
        CONSTRAINT "PK_InterviewSlot" PRIMARY KEY ("id"),
        CONSTRAINT "FK_InterviewSlot_interviewRoundId" FOREIGN KEY ("interviewRoundId")
          REFERENCES "InterviewRound"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "InterviewSlot_interviewRoundId_startAt_idx" ON "InterviewSlot" ("interviewRoundId", "startAt")`);
    await queryRunner.query(`CREATE INDEX "InterviewSlot_status_startAt_idx" ON "InterviewSlot" ("status", "startAt")`);

    await queryRunner.query(`
      CREATE TABLE "InterviewBooking" (
        "id" text NOT NULL,
        "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "interviewSlotId" text NOT NULL,
        "interviewRoundId" text NOT NULL,
        "applicationId" text NOT NULL,
        "status" "InterviewBookingStatus" NOT NULL DEFAULT 'SCHEDULED',
        "bookedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "candidateTimezone" text NOT NULL DEFAULT 'Asia/Kolkata',
        "meetingLink" text,
        "notes" text,
        CONSTRAINT "PK_InterviewBooking" PRIMARY KEY ("id"),
        CONSTRAINT "FK_InterviewBooking_interviewSlotId" FOREIGN KEY ("interviewSlotId")
          REFERENCES "InterviewSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "FK_InterviewBooking_interviewRoundId" FOREIGN KEY ("interviewRoundId")
          REFERENCES "InterviewRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "FK_InterviewBooking_applicationId" FOREIGN KEY ("applicationId")
          REFERENCES "JobApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "InterviewBooking_interviewSlotId_key" ON "InterviewBooking" ("interviewSlotId")`);
    await queryRunner.query(`CREATE INDEX "InterviewBooking_applicationId_idx" ON "InterviewBooking" ("applicationId")`);
    await queryRunner.query(`CREATE INDEX "InterviewBooking_interviewRoundId_idx" ON "InterviewBooking" ("interviewRoundId")`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "InterviewBooking_one_active_per_round_idx"
      ON "InterviewBooking" ("applicationId", "interviewRoundId")
      WHERE "status" = 'SCHEDULED'
    `);

    await queryRunner.query(`
      CREATE TABLE "SchedulingToken" (
        "id" text NOT NULL,
        "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "applicationId" text NOT NULL,
        "interviewRoundId" text NOT NULL,
        "tokenHash" text NOT NULL,
        "status" "SchedulingTokenStatus" NOT NULL DEFAULT 'ACTIVE',
        "expiresAt" TIMESTAMPTZ(6) NOT NULL,
        "usedAt" TIMESTAMPTZ(6),
        "sentAt" TIMESTAMPTZ(6),
        CONSTRAINT "PK_SchedulingToken" PRIMARY KEY ("id"),
        CONSTRAINT "FK_SchedulingToken_applicationId" FOREIGN KEY ("applicationId")
          REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_SchedulingToken_interviewRoundId" FOREIGN KEY ("interviewRoundId")
          REFERENCES "InterviewRound"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "SchedulingToken_tokenHash_key" ON "SchedulingToken" ("tokenHash")`);
    await queryRunner.query(`CREATE INDEX "SchedulingToken_applicationId_idx" ON "SchedulingToken" ("applicationId")`);
    await queryRunner.query(`CREATE INDEX "SchedulingToken_interviewRoundId_idx" ON "SchedulingToken" ("interviewRoundId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "SchedulingToken"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "InterviewBooking"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "InterviewSlot"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "InterviewAvailability"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "InterviewRound"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "SchedulingTokenStatus"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "InterviewBookingStatus"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "InterviewSlotStatus"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "InterviewRoundStatus"`);
  }
}

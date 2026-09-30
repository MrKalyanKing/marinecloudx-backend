import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Human-readable Careers IDs:
 *   Job         → MCX-YYYY-NNNN
 *   Application → MCX-APP-YYYY-NNNNNN
 *
 * Sequence rows are allocated with INSERT … ON CONFLICT DO UPDATE so concurrent
 * submissions cannot collide. Internal UUIDv7 PKs are unchanged.
 */
export class CareersPublicIds1787100000000 implements MigrationInterface {
  name = "CareersPublicIds1787100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "CareersIdSequence" (
        "kind" text NOT NULL,
        "year" integer NOT NULL,
        "lastValue" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_CareersIdSequence" PRIMARY KEY ("kind", "year")
      )
    `);

    await queryRunner.query(`ALTER TABLE "Job" ADD "jobCode" text`);
    await queryRunner.query(`ALTER TABLE "JobApplication" ADD "applicationCode" text`);

    await queryRunner.query(`
      WITH ranked AS (
        SELECT
          id,
          EXTRACT(YEAR FROM "createdAt" AT TIME ZONE 'UTC')::int AS y,
          ROW_NUMBER() OVER (
            PARTITION BY EXTRACT(YEAR FROM "createdAt" AT TIME ZONE 'UTC')
            ORDER BY "createdAt" ASC, id ASC
          ) AS n
        FROM "Job"
      )
      UPDATE "Job" j
      SET "jobCode" = 'MCX-' || ranked.y::text || '-' || LPAD(ranked.n::text, 4, '0')
      FROM ranked
      WHERE j.id = ranked.id
    `);

    await queryRunner.query(`
      WITH ranked AS (
        SELECT
          id,
          EXTRACT(YEAR FROM "createdAt" AT TIME ZONE 'UTC')::int AS y,
          ROW_NUMBER() OVER (
            PARTITION BY EXTRACT(YEAR FROM "createdAt" AT TIME ZONE 'UTC')
            ORDER BY "createdAt" ASC, id ASC
          ) AS n
        FROM "JobApplication"
      )
      UPDATE "JobApplication" a
      SET "applicationCode" = 'MCX-APP-' || ranked.y::text || '-' || LPAD(ranked.n::text, 6, '0')
      FROM ranked
      WHERE a.id = ranked.id
    `);

    await queryRunner.query(`
      INSERT INTO "CareersIdSequence" ("kind", "year", "lastValue")
      SELECT 'JOB', EXTRACT(YEAR FROM "createdAt" AT TIME ZONE 'UTC')::int, COUNT(*)::int
      FROM "Job"
      GROUP BY 1, 2
    `);

    await queryRunner.query(`
      INSERT INTO "CareersIdSequence" ("kind", "year", "lastValue")
      SELECT 'APPLICATION', EXTRACT(YEAR FROM "createdAt" AT TIME ZONE 'UTC')::int, COUNT(*)::int
      FROM "JobApplication"
      GROUP BY 1, 2
    `);

    await queryRunner.query(`
      ALTER TABLE "Job"
      ALTER COLUMN "jobCode" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "JobApplication"
      ALTER COLUMN "applicationCode" SET NOT NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "Job_jobCode_key" ON "Job" ("jobCode")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "JobApplication_applicationCode_key" ON "JobApplication" ("applicationCode")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "JobApplication_applicationCode_key"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "Job_jobCode_key"`);
    await queryRunner.query(`ALTER TABLE "JobApplication" DROP COLUMN IF EXISTS "applicationCode"`);
    await queryRunner.query(`ALTER TABLE "Job" DROP COLUMN IF EXISTS "jobCode"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "CareersIdSequence"`);
  }
}

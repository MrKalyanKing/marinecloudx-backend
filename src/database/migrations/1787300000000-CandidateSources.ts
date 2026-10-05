import type { MigrationInterface, QueryRunner } from "typeorm";

export class CandidateSources1787300000000 implements MigrationInterface {
  name = "CandidateSources1787300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "ApplicationSource" ADD VALUE IF NOT EXISTS 'CAREERS'`);
    await queryRunner.query(`ALTER TYPE "ApplicationSource" ADD VALUE IF NOT EXISTS 'REFERRAL'`);
    await queryRunner.query(`ALTER TYPE "ApplicationSource" ADD VALUE IF NOT EXISTS 'MANUAL'`);
    await queryRunner.query(`ALTER TYPE "ApplicationSource" ADD VALUE IF NOT EXISTS 'OTHER'`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // In PostgreSQL, enum values cannot be removed without rebuilding the type.
  }
}

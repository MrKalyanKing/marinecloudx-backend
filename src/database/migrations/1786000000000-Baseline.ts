import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Baseline — the schema this project ADOPTS, not one it creates.
 *
 * The 34 tables (28 entities + 6 join tables), 14 enum types and 47 foreign
 * keys already exist in the database: they were built by the original Prisma
 * migration `20260815212852_init` and hold live data. Verified on 2026-09-01
 * with `schema:log` + real read queries through every TypeORM entity — the only
 * differences were cosmetic constraint/index *names*, never structure.
 *
 * `up()` is therefore intentionally empty. Running it registers this baseline in
 * the `_migrations` table so that every FUTURE migration is a diff from a known
 * point, without touching a single existing row or column.
 *
 * A full backup was taken before this was first run:
 *   C:\Users\srika\marinecloudex-backups\neondb-20260901-200235.sql
 *
 * `down()` is a no-op by design — reverting "adopt the existing schema" would
 * mean dropping the entire live database, which no migration should ever do.
 */
export class Baseline1786000000000 implements MigrationInterface {
  name = "Baseline1786000000000";

  public async up(_queryRunner: QueryRunner): Promise<void> {
    // No-op: the schema already exists (adopted from Prisma). See the file header.
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No-op: never drop the adopted schema.
  }
}

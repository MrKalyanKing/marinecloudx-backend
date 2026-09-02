import "reflect-metadata";
import { config as loadDotenv } from "dotenv";
import { DataSource } from "typeorm";

import { ALL_ENTITIES } from "../entities";

/**
 * Standalone DataSource for the TypeORM CLI (migration generate / run / revert).
 *
 *   npm run migration:generate -- src/database/migrations/<Name>
 *   npm run migration:run
 *   npm run migration:revert
 *
 * `synchronize` is hard-wired `false`: schema changes only ever happen through a
 * reviewed migration, never automatically. The Nest runtime uses its own
 * connection (database.module.ts) with the same settings.
 */
loadDotenv();

const url = process.env.DATABASE_URL ?? "";
const useSsl = /sslmode=require|neon\.tech|render\.com|amazonaws\.com/.test(url);

export const AppDataSource = new DataSource({
  type: "postgres",
  url,
  entities: [...ALL_ENTITIES],
  migrations: [__dirname + "/migrations/*.{ts,js}"],
  migrationsTableName: "_migrations",
  synchronize: false,
  logging: process.env.DB_LOGGING === "true",
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

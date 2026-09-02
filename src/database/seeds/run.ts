import "reflect-metadata";
import { config as loadDotenv } from "dotenv";

import { AppDataSource } from "../data-source";
import { seedSystem } from "./system.seed";
import { seedDevAdmin } from "./dev-admin.seed";

/**
 * Seed runner.
 *
 *   npm run seed          system config only (roles, stages, sources)
 *   npm run seed -- admin also creates a Super Admin from DEV_ADMIN_EMAIL /
 *                    DEV_ADMIN_PASSWORD (refused when NODE_ENV=production)
 *
 * Idempotent — safe to run against a database that is already seeded.
 */
loadDotenv();

async function main(): Promise<void> {
  const withAdmin = process.argv.slice(2).includes("admin");

  await AppDataSource.initialize();
  try {
    await seedSystem(AppDataSource);
    if (withAdmin) {
      await seedDevAdmin(AppDataSource);
    } else {
      console.log("seed: skipped dev admin (pass `-- admin` to include it)");
    }
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

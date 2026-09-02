import { type DynamicModule, Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import type { AppConfig } from "../config/configuration";
import { ALL_ENTITIES } from "../entities";

/**
 * Wires TypeORM to PostgreSQL — the only place in the codebase with a database
 * connection.
 *
 * `DatabaseModule.forRoot()` is a no-op when `DATABASE_URL` is unset, so the
 * backend still boots as a stub (current deployments) and only connects once the
 * URL is provided. `synchronize` is always `false`; migrations are run
 * explicitly (see `data-source.ts`).
 */
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const hasUrl = Boolean(process.env.DATABASE_URL);

    if (!hasUrl) {
      new Logger("DatabaseModule").warn(
        "DATABASE_URL is not set — starting without a database connection.",
      );
      return { module: DatabaseModule, imports: [], exports: [] };
    }

    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService<AppConfig, true>) => {
            const db = config.get("database", { infer: true });
            return {
              type: "postgres" as const,
              url: db.url,
              entities: [...ALL_ENTITIES],
              synchronize: false,
              migrationsRun: false,
              logging: db.logging,
              ssl: db.ssl ? { rejectUnauthorized: false } : false,
              autoLoadEntities: false,
            };
          },
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}

/**
 * Typed application configuration, loaded once from the environment.
 *
 * Registered via `ConfigModule.forRoot({ load: [configuration], isGlobal: true })`.
 * Read it with `ConfigService<AppConfig, true>` and a dotted key, e.g.
 * `config.get('auth.cookieName', { infer: true })`.
 *
 * No secret is ever logged or echoed. `validateEnv` (env.ts) runs first and
 * fails the boot if a required variable is missing.
 */

export interface AppConfig {
  app: {
    env: "development" | "test" | "production";
    port: number;
    /** Browser origins allowed to call this API (CORS allow-list). */
    corsOrigins: string[];
  };
  database: {
    url: string;
    /** Never true outside a throwaway local database. */
    synchronize: false;
    ssl: boolean;
    logging: boolean;
  };
  auth: {
    secret: string;
    cookieName: string;
    /** Session lifetime in seconds. 8 hours, matching the legacy app. */
    sessionTtlSeconds: number;
    bcryptCost: number;
  };
  storage: {
    region: string;
    bucket: string | null;
    publicUrl: string | null;
  };
  revalidation: {
    secret: string | null;
    frontendUrl: string | null;
  };
}

function list(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function configuration(): AppConfig {
  const env = (process.env.NODE_ENV ?? "development") as AppConfig["app"]["env"];

  return {
    app: {
      env,
      port: Number(process.env.PORT ?? 3001),
      corsOrigins: list(process.env.CORS_ORIGINS) || [],
    },
    database: {
      url: process.env.DATABASE_URL ?? "",
      synchronize: false,
      ssl: /sslmode=require|neon\.tech|render\.com/.test(process.env.DATABASE_URL ?? ""),
      logging: env === "development" && process.env.DB_LOGGING === "true",
    },
    auth: {
      secret: process.env.AUTH_SECRET ?? "",
      cookieName: process.env.AUTH_COOKIE_NAME ?? "mcx_session",
      sessionTtlSeconds: Number(process.env.AUTH_SESSION_TTL ?? 8 * 60 * 60),
      bcryptCost: Number(process.env.AUTH_BCRYPT_COST ?? 12),
    },
    storage: {
      region: process.env.AWS_REGION ?? "ap-south-1",
      bucket: process.env.AWS_S3_BUCKET || null,
      publicUrl: process.env.AWS_S3_PUBLIC_URL || null,
    },
    revalidation: {
      secret: process.env.REVALIDATE_SECRET || null,
      frontendUrl: process.env.FRONTEND_REVALIDATE_URL || null,
    },
  };
}

/**
 * Boot-time environment validation.
 *
 * Called from `main.ts` before the Nest app is created. Fails loudly and early
 * if a variable the app cannot run without is missing — rather than surfacing
 * later as a confusing runtime error.
 *
 * What is "required" depends on the phase of the migration:
 *   - Always: nothing hard-required yet while the backend is still a shell.
 *   - From Phase 5 (entities): DATABASE_URL.
 *   - From Phase 9 (auth): AUTH_SECRET.
 *
 * Set `REQUIRE_DB=true` / `REQUIRE_AUTH=true` (or rely on NODE_ENV=production,
 * which requires both) to turn the checks on.
 */

const isProd = process.env.NODE_ENV === "production";

interface Rule {
  key: string;
  when: boolean;
  hint: string;
}

export function validateEnv(): void {
  const rules: Rule[] = [
    {
      key: "DATABASE_URL",
      // Required from Phase 7 on: feature modules inject repositories, so the
      // app can no longer boot without a connection.
      when: true,
      hint: "PostgreSQL connection string (same database as the legacy app).",
    },
    {
      key: "AUTH_SECRET",
      when: isProd || process.env.REQUIRE_AUTH === "true",
      hint: "Signs session tokens. Generate with: openssl rand -base64 32",
    },
  ];

  const missing = rules.filter((r) => r.when && !process.env[r.key]);

  if (missing.length > 0) {
    const lines = missing.map((r) => `  - ${r.key}: ${r.hint}`).join("\n");
    throw new Error(`Missing required environment variable(s):\n${lines}`);
  }

  if (isProd && process.env.DATABASE_SYNCHRONIZE === "true") {
    throw new Error(
      "DATABASE_SYNCHRONIZE=true is refused in production. Schema changes go through TypeORM migrations only.",
    );
  }
}

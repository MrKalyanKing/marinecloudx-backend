import * as Sentry from "@sentry/node";
import { Logger } from "@nestjs/common";

const logger = new Logger("Sentry");

/**
 * Resolve Sentry DSN from SENTRY_DSN, SENTRY_KEY, or SENTRY_KEY + SENTRY_PROJECT_ID.
 */
export function resolveSentryDsn(): string | null {
  if (process.env.SENTRY_DSN) {
    return process.env.SENTRY_DSN.trim();
  }
  const key = process.env.SENTRY_KEY?.trim();
  const projectId = process.env.SENTRY_PROJECT_ID?.trim();

  if (key && (key.startsWith("http://") || key.startsWith("https://"))) {
    return key;
  }

  if (key && projectId) {
    return `https://${key}@o${projectId}.ingest.sentry.io/${projectId}`;
  }

  return key || null;
}

/**
 * Initialize Sentry SDK for error reporting and performance tracking.
 *
 * Automatically activates in production when SENTRY_DSN or SENTRY_KEY is set.
 * In development, can be enabled by setting SENTRY_ENABLE_DEV=true.
 */
export function initSentry(): void {
  const dsn = resolveSentryDsn();
  const env = process.env.NODE_ENV ?? "development";
  const isProd = env === "production";
  const isEnabled = Boolean(dsn) && (isProd || process.env.SENTRY_ENABLE_DEV === "true");

  if (!dsn) {
    if (isProd) {
      logger.warn("SENTRY_DSN / SENTRY_KEY is not configured. Sentry error tracking is disabled in production.");
    }
    return;
  }

  if (!isEnabled) {
    logger.log(`Sentry disabled in ${env} environment (set SENTRY_ENABLE_DEV=true to enable locally)`);
    return;
  }

  Sentry.init({
    dsn,
    environment: env,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? (isProd ? 0.2 : 1.0)),
    attachStacktrace: true,
    sendDefaultPii: false,
  });

  logger.log(`🛡️ Sentry initialized successfully in ${env} environment`);
}

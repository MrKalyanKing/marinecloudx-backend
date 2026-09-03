import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import * as Sentry from "@sentry/node";

import type { ApiErrorCode, ApiErrorResponse, ApiFieldError } from "../../contracts";

/**
 * The single place an error becomes an HTTP response.
 *
 * Controllers and services therefore never build a failure envelope: they throw
 * (`NotFoundException`, `ConflictException`, a plain `Error`, or a TypeORM error)
 * and the correct status + `{ success: false, error }` body come out here.
 *
 * Nothing internal is ever serialized — no stack trace, table name, constraint
 * name, driver message or connection detail. 5xx and non-HTTP throws are logged
 * in full, server-side only. Expected 4xx are not logged as errors (normal
 * traffic), matching the legacy `handleApiRoute` behaviour.
 *
 * All 5xx and unexpected internal exceptions are reported to Sentry with
 * contextual tags, request metadata, and authenticated user info.
 */

const STATUS_TO_CODE: Partial<Record<number, ApiErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: "VALIDATION_ERROR",
  [HttpStatus.UNAUTHORIZED]: "UNAUTHORIZED",
  [HttpStatus.FORBIDDEN]: "FORBIDDEN",
  [HttpStatus.NOT_FOUND]: "NOT_FOUND",
  [HttpStatus.CONFLICT]: "CONFLICT",
  [HttpStatus.TOO_MANY_REQUESTS]: "RATE_LIMITED",
};

const SAFE_MESSAGE: Record<ApiErrorCode, string> = {
  VALIDATION_ERROR: "Request validation failed",
  UNAUTHORIZED: "Authentication is required",
  FORBIDDEN: "You do not have permission to perform this action",
  NOT_FOUND: "The requested resource was not found",
  CONFLICT: "The request conflicts with the current state",
  RATE_LIMITED: "Too many requests. Please try again later.",
  INTERNAL_ERROR: "An unexpected error occurred",
};

interface Resolved {
  status: number;
  code: ApiErrorCode;
  message: string;
  details?: ApiFieldError[];
  /** Present only for 5xx / unknown — logged, never sent. */
  internal?: unknown;
}

const SENSITIVE_HEADERS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-auth-token",
  "x-api-key",
]);

function sanitizeHeaders(headers?: Record<string, unknown>): Record<string, string> {
  if (!headers) return {};
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (SENSITIVE_HEADERS.has(key.toLowerCase())) {
      clean[key] = "[REDACTED]";
    } else if (typeof value === "string") {
      clean[key] = value;
    }
  }
  return clean;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("Exception");

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const res = http.getResponse<{
      status(code: number): { json(body: unknown): void };
      setHeader(name: string, value: string): void;
    }>();
    const req = http.getRequest<{
      method?: string;
      url?: string;
      requestId?: string;
      query?: Record<string, unknown>;
      headers?: Record<string, unknown>;
      user?: { id?: string; email?: string; role?: string };
    }>();

    const resolved = this.resolve(exception);

    // 429 carries Retry-After, seconds, from the rate-limit guard's `cause`.
    if (resolved.status === HttpStatus.TOO_MANY_REQUESTS) {
      const cause = (exception as { cause?: { retryAfter?: number } }).cause;
      if (cause?.retryAfter && typeof res.setHeader === "function") {
        res.setHeader("Retry-After", String(cause.retryAfter));
      }
    }

    if (resolved.status >= 500) {
      this.logger.error(
        `${req.method ?? "?"} ${req.url ?? "?"} [${req.requestId ?? "-"}] -> ${resolved.status}`,
        resolved.internal instanceof Error ? resolved.internal.stack : String(resolved.internal),
      );

      // Report unhandled 5xx errors to Sentry
      Sentry.withScope((scope) => {
        scope.setTag("status_code", String(resolved.status));
        scope.setTag("error_code", resolved.code);
        if (req.requestId) {
          scope.setTag("request_id", req.requestId);
        }
        if (req.method) {
          scope.setTag("http.method", req.method);
        }
        if (req.url) {
          scope.setTag("http.url", req.url);
        }

        if (req.user?.id || req.user?.email) {
          scope.setUser({
            id: req.user.id,
            email: req.user.email,
            segment: req.user.role,
          });
        }

        scope.setContext("request", {
          method: req.method,
          url: req.url,
          requestId: req.requestId,
          query: req.query,
          headers: sanitizeHeaders(req.headers),
        });

        const errorToCapture =
          resolved.internal instanceof Error
            ? resolved.internal
            : exception instanceof Error
              ? exception
              : new Error(
                  typeof resolved.internal === "string"
                    ? resolved.internal
                    : resolved.message || "Internal Server Error",
                );

        Sentry.captureException(errorToCapture);
      });
    }

    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: resolved.code,
        message: resolved.message,
        ...(resolved.details ? { details: resolved.details } : {}),
      },
    };

    res.status(resolved.status).json(body);
  }

  private resolve(exception: unknown): Resolved {
    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    const typeorm = this.fromTypeOrm(exception);
    if (typeorm) return typeorm;

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: "INTERNAL_ERROR",
      message: SAFE_MESSAGE.INTERNAL_ERROR,
      internal: exception,
    };
  }

  private fromHttpException(exception: HttpException): Resolved {
    const status = exception.getStatus();
    const code = STATUS_TO_CODE[status] ?? "INTERNAL_ERROR";
    const payload = exception.getResponse();

    // ValidationPipe throws BadRequestException with `message: string[]`.
    if (
      status === HttpStatus.BAD_REQUEST &&
      typeof payload === "object" &&
      payload !== null &&
      Array.isArray((payload as { message?: unknown }).message)
    ) {
      const raw = (payload as { message: string[] }).message;
      return {
        status,
        code: "VALIDATION_ERROR",
        message: SAFE_MESSAGE.VALIDATION_ERROR,
        details: raw.map((m) => toFieldError(m)),
      };
    }

    // A hand-thrown HttpException may carry a useful, safe message.
    const message =
      typeof payload === "string"
        ? payload
        : typeof payload === "object" &&
            payload !== null &&
            typeof (payload as { message?: unknown }).message === "string"
          ? (payload as { message: string }).message
          : SAFE_MESSAGE[code];

    return { status, code, message };
  }

  /** Detect TypeORM errors by name so this file needs no `typeorm` import. */
  private fromTypeOrm(exception: unknown): Resolved | null {
    if (typeof exception !== "object" || exception === null) return null;
    const name = (exception as { constructor?: { name?: string } }).constructor?.name;

    if (name === "EntityNotFoundError") {
      return { status: HttpStatus.NOT_FOUND, code: "NOT_FOUND", message: SAFE_MESSAGE.NOT_FOUND };
    }

    if (name === "QueryFailedError") {
      const pg = (exception as { driverError?: { code?: string } }).driverError?.code;
      if (pg === "23505") {
        return { status: HttpStatus.CONFLICT, code: "CONFLICT", message: SAFE_MESSAGE.CONFLICT };
      }
      if (pg === "23503") {
        return {
          status: HttpStatus.NOT_FOUND,
          code: "NOT_FOUND",
          message: "A referenced record does not exist",
        };
      }
      if (pg === "23502" || pg === "22P02" || pg === "23514") {
        return {
          status: HttpStatus.BAD_REQUEST,
          code: "VALIDATION_ERROR",
          message: SAFE_MESSAGE.VALIDATION_ERROR,
        };
      }
      // Any other query failure is a bug — treat as 500 and log it.
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        code: "INTERNAL_ERROR",
        message: SAFE_MESSAGE.INTERNAL_ERROR,
        internal: exception,
      };
    }

    return null;
  }
}

/**
 * Splits a `field.path: message` line (produced by the ValidationPipe's
 * exceptionFactory) into `{ path, message }`. Falls back to `(root)` for any
 * line that is not in that shape.
 */
function toFieldError(line: string): ApiFieldError {
  const idx = line.indexOf(": ");
  if (idx > 0) {
    const path = line.slice(0, idx);
    if (/^[a-zA-Z_][\w.[\]]*$/.test(path)) {
      return { path, message: line.slice(idx + 2) };
    }
  }
  return { path: "(root)", message: line };
}

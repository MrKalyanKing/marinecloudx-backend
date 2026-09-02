import {
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import {
  RATE_LIMIT_KEY,
  type RateLimitConfig,
} from "../decorators/rate-limit.decorator";

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Process-local fixed-window rate limiter — the same shape and quotas as the
 * legacy app, and with the same honest limitation: counters live in a `Map` in
 * one Node process, reset on deploy/restart, and behind N instances the
 * effective quota is roughly N×. Real defence against a stuck submit button, a
 * naive script and single-source stuffing; not distributed protection.
 *
 * Runs before the validation pipe, so a rejected request never reaches the
 * parser — a script posting malformed payloads is exactly what this stops, so
 * (for the default mode) even a request that will fail validation consumes
 * quota.
 *
 * Client key: `x-forwarded-for` → `x-real-ip` → a shared `unknown` bucket
 * (never waved through).
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly reflector: Reflector = new Reflector()) {
    this.reflector = reflector ?? new Reflector();
  }

  canActivate(context: ExecutionContext): boolean {
    const config = this.reflector.getAllAndOverride<RateLimitConfig | undefined>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!config) return true;

    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      method: string;
      route?: { path?: string };
      url?: string;
    }>();

    const client = this.clientKey(req.headers);
    const routeKey = `${req.method}:${req.route?.path ?? req.url ?? "?"}`;
    const key = `${routeKey}|${client}`;
    const now = Date.now();

    // Failures-only mode is resolved after the handler runs (an interceptor
    // would be the place); the guard only pre-checks the ceiling here.
    let bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + config.windowMs };
      this.buckets.set(key, bucket);
    }

    if (bucket.count >= config.limit) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: "Too many requests. Please try again later.",
        },
        HttpStatus.TOO_MANY_REQUESTS,
        { cause: { retryAfter } },
      );
    }

    if (!config.countFailuresOnly) {
      bucket.count += 1;
    }

    return true;
  }

  private clientKey(headers: Record<string, string | string[] | undefined>): string {
    const fwd = headers["x-forwarded-for"];
    const first = Array.isArray(fwd) ? fwd[0] : fwd;
    const ip = first?.split(",")[0]?.trim();
    if (ip) return ip;

    const real = headers["x-real-ip"];
    const realIp = Array.isArray(real) ? real[0] : real;
    if (realIp) return realIp.trim();

    return "unknown";
  }
}

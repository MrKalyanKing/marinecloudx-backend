import { SetMetadata } from "@nestjs/common";

export const RATE_LIMIT_KEY = "mcx:rateLimit";

export interface RateLimitConfig {
  /** Max requests allowed per window, per client. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /**
   * When true, a request that reaches the handler without throwing does NOT
   * consume quota, and a success clears the client's counter. Used for
   * sign-in (Phase 9): count failures only.
   */
  countFailuresOnly?: boolean;
}

/**
 * Marks a route for process-local fixed-window rate limiting.
 *
 *   @RateLimit({ limit: 5, windowMs: 10 * 60_000 })
 *   @Post("leads")
 */
export const RateLimit = (config: RateLimitConfig) => SetMetadata(RATE_LIMIT_KEY, config);

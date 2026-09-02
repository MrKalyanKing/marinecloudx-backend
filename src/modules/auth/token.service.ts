import { Injectable } from "@nestjs/common";
import jwt from "jsonwebtoken";

/**
 * Session tokens.
 *
 * The token carries the **user id and nothing else** — no role, no
 * capabilities. Role is re-read from the database on every authorization check
 * (auth.guard.ts), so suspending an account takes effect on the next request
 * rather than whenever the token expires, and no stale role claim can be
 * trusted. Lifetime 8 hours, matching the legacy app.
 */
export interface SessionClaims {
  sub: string;
}

@Injectable()
export class TokenService {
  private readonly secret: string;
  private readonly ttlSeconds: number;

  constructor() {
    this.secret = process.env.AUTH_SECRET ?? "";
    this.ttlSeconds = Number(process.env.AUTH_SESSION_TTL ?? 8 * 60 * 60);
  }

  sign(userId: string): string {
    return jwt.sign({ sub: userId }, this.secret, {
      expiresIn: this.ttlSeconds,
      algorithm: "HS256",
    });
  }

  /** Returns the user id, or null for any invalid / expired / malformed token. */
  verify(token: string): string | null {
    try {
      const decoded = jwt.verify(token, this.secret, { algorithms: ["HS256"] });
      if (typeof decoded === "object" && decoded && typeof decoded.sub === "string") {
        return decoded.sub;
      }
      return null;
    } catch {
      return null;
    }
  }

  get maxAgeMs(): number {
    return this.ttlSeconds * 1000;
  }
}

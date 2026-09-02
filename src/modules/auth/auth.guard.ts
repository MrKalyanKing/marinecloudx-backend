import { type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";

import type { AuthenticatedUser } from "../../common";
import { AuthService } from "./auth.service";

/**
 * Populates `request.user` when the caller presents a valid session.
 *
 * Non-blocking — it always returns `true`. `@Public()` routes then work, and
 * `CapabilitiesGuard` (registered after this one) is what produces the 401/403.
 * There is one identity-resolution path for the whole API.
 *
 * Accepts the session either as the httpOnly cookie (browsers) or as
 * `Authorization: Bearer <token>` (a server component forwarding it).
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly cookieName: string;

  constructor(
    private readonly authService: AuthService,
  ) {
    this.cookieName = process.env.AUTH_COOKIE_NAME ?? "mcx_session";
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{
      cookies?: Record<string, string>;
      headers: Record<string, string | string[] | undefined>;
      user?: AuthenticatedUser;
    }>();

    const token = this.extractToken(req);
    if (token) {
      const user = await this.authService.resolve(token);
      if (user) req.user = user;
    }
    return true;
  }

  private extractToken(req: {
    cookies?: Record<string, string>;
    headers: Record<string, string | string[] | undefined>;
  }): string | null {
    const fromCookie = req.cookies?.[this.cookieName];
    if (fromCookie) return fromCookie;

    const header = req.headers["authorization"];
    const value = Array.isArray(header) ? header[0] : header;
    if (value?.toLowerCase().startsWith("bearer ")) {
      return value.slice(7).trim();
    }
    return null;
  }
}

import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import type { Capability } from "../../contracts";
import type { AuthenticatedUser } from "../decorators/current-user.decorator";
import { CAPABILITIES_KEY } from "../decorators/require-capability.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

/**
 * Authorization gate for every route.
 *
 * 1. `@Public()` route → always allowed.
 * 2. No authenticated user → 401.
 * 3. `@RequireCapability(...)` present → user must hold every listed capability,
 *    else 403.
 * 4. Authenticated but no capability requirement → allowed (any signed-in user).
 *
 * The user is put on the request by the auth guard (Phase 9). Until then only
 * `@Public()` routes resolve; everything else correctly returns 401.
 *
 * This mirrors the legacy rule: `/admin/**` is capability-checked, the UI's
 * hiding of controls is never a security boundary — this guard is.
 */
@Injectable()
export class CapabilitiesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector = new Reflector()) {
    this.reflector = reflector ?? new Reflector();
  }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException();
    }

    const required = this.reflector.getAllAndOverride<Capability[] | undefined>(CAPABILITIES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const held = new Set(user.capabilities);
    const missing = required.filter((cap) => !held.has(cap));
    if (missing.length > 0) {
      throw new ForbiddenException();
    }

    return true;
  }
}

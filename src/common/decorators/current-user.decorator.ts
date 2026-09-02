import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import type { Capability } from "../../contracts";

/**
 * The verified caller, resolved by the auth guard (Phase 9) and attached to the
 * request. Identity is always server-derived — never read from the request body.
 */
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleSlug: string;
  capabilities: readonly Capability[];
}

/**
 * `@CurrentUser()` → the whole user.
 * `@CurrentUser("id")` → one field.
 *
 * Undefined on public routes. Services that need attribution should take the id
 * explicitly rather than reaching for request state.
 */
export const CurrentUser = createParamDecorator(
  (field: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;
    return field ? user?.[field] : user;
  },
);

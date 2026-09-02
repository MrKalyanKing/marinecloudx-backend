import { SetMetadata } from "@nestjs/common";

import type { Capability } from "../../contracts";

/**
 * Declares the capability (or capabilities) a route requires.
 *
 * Routes ask for a capability, never a role name — the role → capability map
 * lives in one place (auth module, Phase 9). All listed capabilities are
 * required (AND).
 *
 *   @RequireCapability("crm:read")
 *   @Get("leads")
 *   list() { ... }
 */
export const CAPABILITIES_KEY = "mcx:capabilities";

export const RequireCapability = (...capabilities: Capability[]) =>
  SetMetadata(CAPABILITIES_KEY, capabilities);

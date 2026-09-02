import { CAPABILITIES, type Capability } from "../../contracts";

/**
 * Role → capability mapping. Ported verbatim from the legacy
 * `src/features/auth/services/roles.ts`.
 *
 * Routes ask for a capability, never a role name — the day granular
 * permissions arrive, only this map changes. Unknown roles get NOTHING
 * (deny by default): a role an admin creates later cannot enter the admin area
 * until it is mapped here.
 */
export const ROLE_SLUGS = {
  SUPER_ADMIN: "super-admin",
  ADMIN: "admin",
  MANAGER: "manager",
  SALES: "sales",
  CONTENT_MANAGER: "content-manager",
} as const;

export type RoleSlug = (typeof ROLE_SLUGS)[keyof typeof ROLE_SLUGS];

const CRM: Capability[] = [CAPABILITIES.CRM_READ, CAPABILITIES.CRM_WRITE];
const CMS: Capability[] = [CAPABILITIES.CMS_READ, CAPABILITIES.CMS_WRITE];

const ROLE_CAPABILITIES: Record<RoleSlug, readonly Capability[]> = {
  [ROLE_SLUGS.SUPER_ADMIN]: Object.values(CAPABILITIES),
  [ROLE_SLUGS.ADMIN]: [...CRM, ...CMS, CAPABILITIES.TEAM_MANAGE],
  [ROLE_SLUGS.MANAGER]: CRM,
  [ROLE_SLUGS.SALES]: CRM,
  [ROLE_SLUGS.CONTENT_MANAGER]: CMS,
};

function isKnownRole(slug: string): slug is RoleSlug {
  return slug in ROLE_CAPABILITIES;
}

/** Unknown roles — including any an admin creates later — get nothing. */
export function capabilitiesForRole(slug: string): readonly Capability[] {
  return isKnownRole(slug) ? ROLE_CAPABILITIES[slug] : [];
}

export function roleSlugsWithCapability(capability: Capability): RoleSlug[] {
  return (Object.keys(ROLE_CAPABILITIES) as RoleSlug[]).filter((slug) =>
    ROLE_CAPABILITIES[slug].includes(capability),
  );
}

/**
 * Roles a lead or task may be assigned to — derived, never hand-maintained.
 * Assignment means "you own this work", so the target must hold `crm:write`
 * (excludes CONTENT_MANAGER).
 */
export const CRM_ASSIGNABLE_ROLE_SLUGS: RoleSlug[] = roleSlugsWithCapability(
  CAPABILITIES.CRM_WRITE,
);

export function roleCanAccessAdmin(slug: string): boolean {
  return capabilitiesForRole(slug).length > 0;
}

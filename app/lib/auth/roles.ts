import type { UserRole } from "../db/types";

export type UserPermission =
  | "manage_finance"
  | "manage_recruiting"
  | "publish_job_postings"
  | "manage_members"
  | "manage_organization_structure"
  | "manage_roles"
  | "manage_organization_settings"
  | "manage_projects"
  | "view_audit_logs";

export type FunctionalArea = "finance_legal" | "people_culture";

export interface OrganizationalAccess {
  functionalAreas: FunctionalArea[];
  ledTeamIds: string[];
}

export interface PermissionActor {
  role?: unknown;
  access?: OrganizationalAccess;
}

export const USER_PERMISSIONS = {
  finance: "manage_finance",
  recruiting: "manage_recruiting",
  publishJobPostings: "publish_job_postings",
  members: "manage_members",
  organizationStructure: "manage_organization_structure",
  roles: "manage_roles",
  organizationSettings: "manage_organization_settings",
  projects: "manage_projects",
  auditLogs: "view_audit_logs",
} as const satisfies Record<string, UserPermission>;

export function normalizeUserRole(role: unknown): UserRole {
  return role === "admin" ? "admin" : "member";
}

export function normalizeOptionalUserRole(role: unknown): UserRole | undefined {
  if (role === undefined || role === null) return undefined;
  return normalizeUserRole(role);
}

export function hasRoleAccess(role: unknown, requiredRole: UserRole): boolean {
  if (requiredRole === "member") return true;
  return normalizeUserRole(role) === "admin";
}

export function hasPermission(
  actor: PermissionActor | null | undefined,
  permission: UserPermission,
): boolean {
  if (normalizeUserRole(actor?.role) === "admin") return true;

  const access = actor?.access;
  if (!access) return false;
  if (permission === USER_PERMISSIONS.recruiting) {
    return access.ledTeamIds.length > 0;
  }
  if (permission === USER_PERMISSIONS.finance) {
    return access.functionalAreas.includes("finance_legal");
  }
  if (
    permission === USER_PERMISSIONS.publishJobPostings ||
    permission === USER_PERMISSIONS.members ||
    permission === USER_PERMISSIONS.organizationStructure
  ) {
    return access.functionalAreas.includes("people_culture");
  }
  return false;
}

export function recruitingTeamIds(user: PermissionActor): string[] | null {
  if (normalizeUserRole(user.role) === "admin") return null;
  if (user.access?.functionalAreas.includes("people_culture")) return null;
  return user.access?.ledTeamIds ?? [];
}

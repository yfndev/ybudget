import { users } from "../db/collections";
import type { User, UserRole } from "../db/types";
import { isUnavailableMemberStatus } from "../members/status";
import { auth } from "./index";
import { resolveOrganizationalAccess } from "./organizationalAccess";
import {
  hasPermission,
  hasRoleAccess,
  normalizeUserRole,
  type OrganizationalAccess,
  type UserPermission,
} from "./roles";

export type AuthorizedUser = User & {
  organizationId: string;
  role: UserRole;
  access?: OrganizationalAccess;
};

export async function requireAuthenticatedUser({
  allowDeletedWorkspaceAccount = false,
}: {
  allowDeletedWorkspaceAccount?: boolean;
} = {}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized user");

  const user = await (await users()).findOne({ _id: userId });
  if (!user) throw new Error("User not found");
  if (user.workspaceAccountDeletedAt && !allowDeletedWorkspaceAccount) {
    throw new Error("User is unavailable");
  }

  return user;
}

export async function requireUser(): Promise<AuthorizedUser> {
  const user = await requireAuthenticatedUser();
  if (!user.organizationId) throw new Error("User has no organization");
  if (isUnavailableMemberStatus(user.memberStatus)) {
    throw new Error("User is unavailable");
  }
  if (user.memberStatus === "onboarding") {
    throw new Error("Member is awaiting approval");
  }

  const role = normalizeUserRole(user.role);
  const access = await resolveOrganizationalAccess(user);
  return { ...user, organizationId: user.organizationId, role, access };
}

export async function requireRole(requiredRole: UserRole) {
  const user = await requireUser();
  if (!hasRoleAccess(user.role, requiredRole)) {
    throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
  }
  return user;
}

export async function requirePermission(permission: UserPermission) {
  const user = await requireUser();
  if (!hasPermission(user, permission)) {
    throw new Error(
      `Insufficient permissions. Required permission: ${permission}`,
    );
  }
  return user;
}

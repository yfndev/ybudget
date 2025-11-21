import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getCurrentUser } from "./getCurrentUser";

export type UserRole = "admin" | "lead" | "member";

const roleHierarchy = { member: 0, lead: 1, admin: 2 };

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  minRole: UserRole,
) {
  const user = await getCurrentUser(ctx);
  const userRole = user.role ?? "member";
  if (roleHierarchy[userRole] < roleHierarchy[minRole]) {
    throw new Error(`Insufficient permissions. Required role: ${minRole}`);
  }
}

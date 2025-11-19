import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getCurrentUser } from "./getCurrentUser";

export type UserRole = "admin" | "finance" | "editor" | "viewer";

const roleHierarchy = { viewer: 0, editor: 1, finance: 2, admin: 3 };

export async function requireRole(ctx: QueryCtx | MutationCtx, minRole: UserRole) {
  const user = await getCurrentUser(ctx);
  const userRole = user.role ?? "viewer";
  if (roleHierarchy[userRole] < roleHierarchy[minRole]) {
    throw new Error(`Insufficient permissions. Required role: ${minRole}`);
  }
}

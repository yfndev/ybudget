import { QueryCtx, MutationCtx } from "../_generated/server";
import { getCurrentUser } from "./getCurrentUser";

export type UserRole = "admin" | "editor" | "viewer";

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  minRole: UserRole
): Promise<void> {
  const user = await getCurrentUser(ctx);
  const userRole: UserRole = user.role ?? "viewer";

  const roleLevel: Record<UserRole, number> = {
    viewer: 0,
    editor: 1,
    admin: 2,
  };

  if (roleLevel[userRole] < roleLevel[minRole]) {
    throw new Error(`Insufficient permissions. Required role: ${minRole}`);
  }
}

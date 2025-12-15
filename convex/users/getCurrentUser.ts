import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthorized user");
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");
  if (!user.organizationId) throw new Error("User has no organization");

  return {
    ...user,
    organizationId: user.organizationId,
    role: user.role as "admin" | "lead" | "member" | undefined,
  };
}

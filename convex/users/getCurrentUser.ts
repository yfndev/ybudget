import { type Doc, getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthorized user");
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");
  return user as Doc<"users"> & {
    organizationId: Id<"organizations">;
    role?: "admin" | "editor" | "viewer";
  };
}

import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const user = await ctx.db.get(userId);
  if (!user) return null;
  return user as Doc<"users"> & { organizationId: NonNullable<Doc<"users">["organizationId"]> };
}
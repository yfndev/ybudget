import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "../../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../../_generated/server";


export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);

    return user as Doc<"users"> & { organizationId: NonNullable<Doc<"users">["organizationId"]> };
  }
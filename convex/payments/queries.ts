import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../_generated/server";

export const getActivePayment = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) return null;

    const organizationId = user.organizationId;
    return await ctx.db
      .query("payments")
      .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .first();
  },
});

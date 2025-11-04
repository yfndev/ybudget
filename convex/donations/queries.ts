import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getAvailableDonationsForProject = query({
  args: { projectId: v.string() },

  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    return await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("projectId"), args.projectId),
          q.gt(q.field("amount"), 0),
          q.neq(q.field("donorId"), ""),
          q.eq(q.field("status"), "processed"), // only actual donations, not expected ones
        ),
      )
      .collect();
  },
});

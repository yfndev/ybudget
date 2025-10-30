import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedUser } from "../utils/auth";

export const getSpentBudget = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    projectId: v.optional(v.string()),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return 0;

    let query = ctx.db
      .query("transactions")
      .withIndex("by_organization_date", (q) =>
        q
          .eq("organizationId", user.organizationId)
          .gte("date", args.startDate)
          .lte("date", args.endDate)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "processed"),
          q.neq(q.field("projectId"), "")
        )
      );

    if (args.projectId) {
      query = query.filter((q) => q.eq(q.field("projectId"), args.projectId));
    }

    const transactions = await query.collect();

    const total = transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
    return Math.abs(total);
  },
});

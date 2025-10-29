import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedUser } from "../utils/auth";

export const getSpentBudget = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return 0;

    const transactions = await ctx.db
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
      )
      .collect();

    const total = transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
    return Math.abs(total);
  },
});

import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedUser } from "../utils/auth";

export const getFilteredTransactions = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    projectId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
      .filter(q => q.and(
        q.gte(q.field("date"), args.startDate),
        q.lte(q.field("date"), args.endDate)
      ))
      .collect();

    if (args.projectId) {
      return transactions.filter(t => t.projectId === args.projectId);
    }

    return transactions;
  },
});

export const getAllTransactions = query({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
      .collect();
  },
});
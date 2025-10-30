import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getAuthenticatedUser } from "../../utils/auth";

export const getDonorTransactions = query({
    args: { donorId: v.id("donors") },
    returns: v.array(
      v.object({
        _id: v.id("transactions"),
        projectId: v.string(),
        date: v.number(),
        amount: v.number(),
        description: v.string(),
        counterparty: v.string(),
        categoryId: v.string(),
        status: v.union(v.literal("expected"), v.literal("processed")),
      })
    ),
    handler: async (ctx, args) => {
      const user = await getAuthenticatedUser(ctx);
      if (!user) return [];
  
      const transactions = await ctx.db
        .query("transactions")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId)
        )
        .filter((q) =>
          q.and(
            q.eq(q.field("donorId"), args.donorId.toString()),
            q.gt(q.field("amount"), 0)
          )
        )
        .collect();
  
      return transactions.map((t) => ({
        _id: t._id,
        projectId: t.projectId,
        date: t.date,
        amount: t.amount,
        description: t.description,
        counterparty: t.counterparty,
        categoryId: t.categoryId,
        status: t.status,
      }));
    },
  });
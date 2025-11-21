import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";
import { requireRole } from "../users/permissions";

export const allocateBudget = mutation({
  args: {
    transactionId: v.id("transactions"),
    allocations: v.array(
      v.object({
        projectId: v.id("projects"),
        amount: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "lead");
    const user = await getCurrentUser(ctx);
    const transaction = await ctx.db.get(args.transactionId);

    if (!transaction) throw new Error("Transaction not found");
    if (transaction.organizationId !== user.organizationId) {
      throw new Error("Access denied");
    }
    if (transaction.amount <= 0) {
      throw new Error("Can only allocate budget from income");
    }

    const totalAllocated = args.allocations.reduce(
      (sum, a) => sum + a.amount,
      0,
    );
    if (totalAllocated > transaction.amount) {
      throw new Error("Total exceeds transaction amount");
    }

    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_source_transaction", (q) =>
        q.eq("sourceTransactionId", args.transactionId),
      )
      .collect();

    for (const budget of existing) {
      await ctx.db.delete(budget._id);
    }

    for (const allocation of args.allocations) {
      if (allocation.amount > 0) {
        await ctx.db.insert("budgets", {
          projectId: allocation.projectId,
          amount: allocation.amount,
          allocatedBy: user._id,
          sourceTransactionId: args.transactionId,
        });
      }
    }
  },
});

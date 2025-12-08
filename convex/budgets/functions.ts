import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";
import { requireRole } from "../users/permissions";

export const setBudgets = mutation({
  args: {
    transactionId: v.id("transactions"),
    budgets: v.array(
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
      throw new Error("Can only set budget from income");
    }

    const totalBudgeted = args.budgets.reduce(
      (sum, budget) => sum + budget.amount,
      0,
    );
    if (totalBudgeted > transaction.amount) {
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

    for (const budget of args.budgets) {
      if (budget.amount > 0) {
        await ctx.db.insert("budgets", {
          projectId: budget.projectId,
          amount: budget.amount,
          budgetedBy: user._id,
          sourceTransactionId: args.transactionId,
        });
      }
    }
  },
});

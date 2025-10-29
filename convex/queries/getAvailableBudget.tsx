import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedUser } from "../utils/auth";

export const getAvailableBudget = query({
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
      .collect();

    let plannedIncomeAmount = 0;
    let receivedAmount = 0;
    let spentAmount = 0;

    for (const transaction of transactions) {
      const isPlannedIncome =
        transaction.status === "expected" &&
        transaction.amount > 0 &&
        !transaction.matchedTransactionId;

      const isReceivedIncome =
        transaction.status === "processed" && transaction.amount > 0;

      const isSpentExpense =
        transaction.status === "processed" && transaction.amount < 0;

      if (isPlannedIncome) {
        plannedIncomeAmount += transaction.amount;
      } else if (isReceivedIncome) {
        receivedAmount += transaction.amount;
      } else if (isSpentExpense) {
        spentAmount += Math.abs(transaction.amount);
      }
    }

    return plannedIncomeAmount + receivedAmount - spentAmount;
  },
});

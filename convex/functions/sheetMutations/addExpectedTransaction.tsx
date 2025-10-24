import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const addExpectedTransaction = mutation({
  args: {
    id: v.string(), // generated on client
    projectId: v.string(),
    expectedDate: v.number(), //epoch timestamp
    amount: v.number(),
    reference: v.string(),
    categoryId: v.string(),
    donorId: v.string(),
    isExpense: v.boolean(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("expectedTransactions", {
      id: args.id,
      projectId: args.projectId,
      expectedDate: args.expectedDate,
      amount: args.amount,
      reference: args.reference,
      categoryId: args.categoryId,
      donorId: args.donorId,
      isExpense: args.isExpense,
      createdBy: args.createdBy,
    });
  },
});

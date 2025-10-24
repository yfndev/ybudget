import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const addExpectedTransaction = mutation({
  args: {
    projectId: v.string(),
    expectedDate: v.number(),
    amount: v.number(),
    reference: v.string(),
    categoryId: v.string(),

    isExpense: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    await ctx.db.insert("expectedTransactions", {
      projectId: args.projectId,
      expectedDate: args.expectedDate,
      amount: args.amount,
      reference: args.reference,
      categoryId: args.categoryId,
      isExpense: args.isExpense,
      createdBy: identity.subject,
    });
  },
});

export const addProject = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    parentId: v.string(),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
  },
});

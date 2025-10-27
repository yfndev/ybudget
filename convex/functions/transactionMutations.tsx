import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedUser } from "../utils/auth";

export const addTransaction = mutation({
  args: {
    projectId: v.string(),
    date: v.number(),
    amount: v.number(),
    reference: v.string(),
    categoryId: v.string(),
    isExpense: v.boolean(),
    status: v.union(v.literal("expected"), v.literal("actual")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      throw new Error("Unauthenticated");
    }

    await ctx.db.insert("transactions", {
      projectId: args.projectId,
      date: args.date,
      amount: args.amount,
      reference: args.reference,
      categoryId: args.categoryId,
      donorId: "",
      isExpense: args.isExpense,
      importedBy: user._id,
      status: args.status,
      organizationId: user.organizationId,
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

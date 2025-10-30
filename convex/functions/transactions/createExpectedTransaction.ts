import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getCurrentUser } from "../../queries/users/getCurrentUser";

export const createExpectedTransaction = mutation({
    args: {
      projectId: v.string(),
      date: v.number(),
      amount: v.number(),
      description: v.string(),
      counterparty: v.string(),
      categoryId: v.string(),
      status: v.literal("expected"),
      donorId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      const user = await getCurrentUser(ctx);
      if (!user) {
        throw new Error("Unauthenticated");
      }
  
      await ctx.db.insert("transactions", {
        projectId: args.projectId,
        date: args.date,
        amount: args.amount,
        description: args.description,
        counterparty: args.counterparty,
        categoryId: args.categoryId,
        donorId: args.donorId || "",
        importedBy: user._id,
        status: args.status,
        organizationId: user.organizationId,
      });
    },
  });
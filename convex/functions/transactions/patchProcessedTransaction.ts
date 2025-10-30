import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getCurrentUser } from "../../queries/users/getCurrentUser";

export const updateProcessedTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    projectId: v.optional(v.string()),
    categoryId: v.optional(v.string()),
    donorId: v.optional(v.string()),
    matchedTransactionId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not found");

    const updateData: {
      projectId?: string;
      categoryId?: string;
      donorId?: string;
      matchedTransactionId?: string;
    } = {};
    if (args.projectId !== undefined && args.categoryId !== undefined && args.donorId !== undefined) {
        updateData.projectId = args.projectId;
        updateData.categoryId = args.categoryId;
        updateData.donorId = args.donorId;
        updateData.matchedTransactionId = args.matchedTransactionId;
    }
  
    await ctx.db.patch(args.transactionId, updateData);

  },
});
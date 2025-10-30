import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { mutation } from "../../_generated/server";
import { getCurrentUser } from "../../queries/users/getCurrentUser";

export const updateProcessedTransaction = mutation({
    args: {
      transactionId: v.string(),
      projectId: v.optional(v.string()),
      categoryId: v.optional(v.string()),
      donorId: v.optional(v.string()),
      matchedTransactionId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      const user = await getCurrentUser(ctx);
      if (!user) {
        throw new Error("Unauthenticated");
      }
  
      const updateData: {
        projectId?: string;
        categoryId?: string;
        donorId?: string;
        matchedTransactionId?: string;
      } = {};
  
      if (args.projectId !== undefined) {
        updateData.projectId = args.projectId;
      }
      if (args.categoryId !== undefined) {
        updateData.categoryId = args.categoryId;
      }
      if (args.donorId !== undefined) {
        updateData.donorId = args.donorId;
      }
      if (args.matchedTransactionId !== undefined) {
        updateData.matchedTransactionId = args.matchedTransactionId;
      }
  
      await ctx.db.patch(args.transactionId as Id<"transactions">, updateData);
  
      if (args.matchedTransactionId) {
        const expectedTransaction = await ctx.db.get(
          args.matchedTransactionId as Id<"transactions">
        );
        if (expectedTransaction) {
          await ctx.db.patch(args.matchedTransactionId as Id<"transactions">, {
            matchedTransactionId: args.transactionId,
          });
        }
      }
    },
  });
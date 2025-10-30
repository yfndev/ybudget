import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getCurrentUser } from "../../queries/users/getCurrentUser";

export const createImportedTransaction = mutation({
    args: {
      date: v.number(),
      importedTransactionId: v.string(),
      importSource: v.union(
        v.literal("sparkasse"),
        v.literal("volksbank"),
        v.literal("moss")
      ),
      amount: v.number(),
      description: v.string(),
      counterparty: v.string(),
      accountName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      const user = await getCurrentUser(ctx);
      if (!user) throw new Error("Unauthenticated");
  
      const existing = await ctx.db
        .query("transactions")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId)
        )
        .filter((q) =>
          q.eq(q.field("importedTransactionId"), args.importedTransactionId)
        )
        .first();
  
      if (existing) {
        return { skipped: true };
      }
  
      await ctx.db.insert("transactions", {
        projectId: "",
        date: args.date,
        amount: args.amount,
        description: args.description,
        counterparty: args.counterparty,
        categoryId: "",
        donorId: "",
        importedBy: user._id,
        importedTransactionId: args.importedTransactionId,
        importSource: args.importSource,
        status: "processed",
        organizationId: user.organizationId,
        accountName: args.accountName,
      });
  
      return { inserted: true };
    },
  });
  
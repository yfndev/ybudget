import { v } from "convex/values";
import { api } from "../../_generated/api";
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
  returns: v.object({
    skipped: v.optional(v.boolean()),
    inserted: v.optional(v.boolean()),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthenticated");

    const existingTransaction = await ctx.runQuery(
      api.queries.transactions.getTransactionById,
      {
        importedTransactionId: args.importedTransactionId,
      }
    );

    if (existingTransaction) return { skipped: true };

    await ctx.db.insert("transactions", {
      organizationId: user.organizationId,
      importedBy: user._id,
      date: args.date,
      amount: args.amount,
      description: args.description,
      counterparty: args.counterparty,
      importedTransactionId: args.importedTransactionId,
      importSource: args.importSource,
      status: "processed",
      projectId: "",
      categoryId: "",
      donorId: "",
      accountName: args.accountName,
    });

    return { inserted: true };
  },
});
  
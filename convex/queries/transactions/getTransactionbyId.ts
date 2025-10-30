import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getTransactionById = query({
  args: {
    transactionId: v.optional(v.id("transactions")),
    importedTransactionId: v.optional(v.string()),
  },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not found");

    let transaction;

    if (args.importedTransactionId) {
      transaction = await ctx.db
        .query("transactions")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId)
        )
        .filter((q) =>
          q.eq(q.field("importedTransactionId"), args.importedTransactionId)
        )
        .first();
    } else if (args.transactionId) {
      transaction = await ctx.db.get(args.transactionId);
    }

    return transaction;
  },
});
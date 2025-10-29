import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mutation } from "../_generated/server";
import { getAuthenticatedUser } from "../utils/auth";

export const addExpectedTransaction = mutation({
  args: {
    projectId: v.string(),
    date: v.number(),
    amount: v.number(),
    description: v.string(),
    counterparty: v.string(),
    categoryId: v.string(),
    status: v.literal("expected"),
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
      description: args.description,
      counterparty: args.counterparty,
      categoryId: args.categoryId,
      donorId: "",
      importedBy: user._id,
      status: args.status,
      organizationId: user.organizationId,
    });
  },
});

export const addImportedTransaction = mutation({
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
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      throw new Error("Unauthenticated");
    }

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

export const updateProcessedTransaction = mutation({
  args: {
    transactionId: v.string(),
    projectId: v.optional(v.string()),
    categoryId: v.optional(v.string()),
    matchedTransactionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      throw new Error("Unauthenticated");
    }

    const updateData: {
      projectId?: string;
      categoryId?: string;
      matchedTransactionId?: string;
    } = {};

    if (args.projectId !== undefined) updateData.projectId = args.projectId;
    if (args.categoryId !== undefined) updateData.categoryId = args.categoryId;
    if (args.matchedTransactionId !== undefined)
      updateData.matchedTransactionId = args.matchedTransactionId;

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

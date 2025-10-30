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
    donorId: v.optional(v.string()),
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
      donorId: args.donorId || "",
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
    donorId: v.optional(v.string()),
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

export const updateTransaction = mutation({
  args: {
    transactionId: v.string(),
    description: v.optional(v.string()),
    amount: v.optional(v.number()),
    date: v.optional(v.number()),
    projectId: v.optional(v.string()),
    categoryId: v.optional(v.string()),
    counterparty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      throw new Error("Unauthenticated");
    }

    const transaction = await ctx.db.get(
      args.transactionId as Id<"transactions">
    );
    if (!transaction || transaction.organizationId !== user.organizationId) {
      throw new Error("Transaction not found or unauthorized");
    }

    const updateData: {
      description?: string;
      amount?: number;
      date?: number;
      projectId?: string;
      categoryId?: string;
      counterparty?: string;
    } = {};

    if (args.description !== undefined) {
      updateData.description = args.description;
    }
    if (args.amount !== undefined) {
      updateData.amount = args.amount;
    }
    if (args.date !== undefined) {
      updateData.date = args.date;
    }
    if (args.projectId !== undefined) {
      updateData.projectId = args.projectId;
    }
    if (args.categoryId !== undefined) {
      updateData.categoryId = args.categoryId;
    }
    if (args.counterparty !== undefined) {
      updateData.counterparty = args.counterparty;
    }

    await ctx.db.patch(args.transactionId as Id<"transactions">, updateData);
  },
});

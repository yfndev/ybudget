import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";
import { requireRole } from "../users/permissions";

export const createExpectedTransaction = mutation({
  args: {
    projectId: v.id("projects"),
    date: v.number(),
    amount: v.number(),
    description: v.string(),
    counterparty: v.string(),
    categoryId: v.id("categories"),
    status: v.literal("expected"),
    donorId: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    await requireRole(ctx, "editor");
    const user = await getCurrentUser(ctx);

    return await ctx.db.insert("transactions", {
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

export const createImportedTransaction = mutation({
  args: {
    date: v.number(),
    importedTransactionId: v.string(),
    importSource: v.union(
      v.literal("sparkasse"),
      v.literal("volksbank"),
      v.literal("moss"),
    ),
    amount: v.number(),
    description: v.string(),
    counterparty: v.string(),
    accountName: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    await requireRole(ctx, "editor");
    const user = await getCurrentUser(ctx);

    const existing = await ctx.db
      .query("transactions")
      .withIndex("by_importedTransactionId", (q) =>
        q
          .eq("organizationId", user.organizationId)
          .eq("importedTransactionId", args.importedTransactionId),
      )
      .first();

    if (existing) return { skipped: true };

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
      projectId: undefined,
      categoryId: undefined,
      donorId: "",
      accountName: args.accountName,
    });

    return { inserted: true };
  },
});

export const updateTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    date: v.optional(v.number()),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    categoryId: v.optional(v.id("categories")),
    donorId: v.optional(v.string()),
    matchedTransactionId: v.optional(v.string()),
    status: v.optional(v.union(v.literal("expected"), v.literal("processed"))),
  },

  handler: async (ctx, { transactionId, ...updates }) => {
    await requireRole(ctx, "editor");
    const validUpdates = Object.fromEntries(
      Object.entries(updates).filter(
        ([_, value]) => value !== undefined && value !== "",
      ),
    );

    return await ctx.db.patch(transactionId, validUpdates);
  },
});

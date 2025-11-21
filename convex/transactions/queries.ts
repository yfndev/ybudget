import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { filterByProjectAccess } from "../teams/permissions";
import { getCurrentUser } from "../users/getCurrentUser";
import { addProjectAndCategoryNames } from "../utils/addProjectNames";

export const getAllTransactions = query({
  args: {
    projectId: v.optional(v.id("projects")),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // if no projectId is set, it returns all transactions within the org
    const query = args.projectId
      ? ctx.db
          .query("transactions")
          .withIndex("by_organization_project", (q) =>
            q
              .eq("organizationId", user.organizationId)
              .eq("projectId", args.projectId),
          )
      : ctx.db
          .query("transactions")
          .withIndex("by_organization", (q) =>
            q.eq("organizationId", user.organizationId),
          );
    let transactions = await query.collect();
    if (!args.includeArchived) {
      transactions = transactions.filter((t) => !t.isArchived);
    }
    const filtered = await filterByProjectAccess(
      ctx,
      user._id,
      user.organizationId,
      transactions,
    );
    return addProjectAndCategoryNames(ctx, filtered);
  },
});

export const getUnassignedProcessedTransactions = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin") return [];

    const allTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .collect();

    const unassigned = allTransactions.filter((t) => {
      if (t.isArchived || t.status !== "processed") return false;
      return !t.projectId || !t.categoryId || (t.amount > 0 && !t.donorId);
    });

    return unassigned.sort((a, b) => b.date - a.date);
  },
});

export const getTransactionRecommendations = query({
  args: { amount: v.number(), projectId: v.optional(v.id("projects")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const query = args.projectId
      ? ctx.db
          .query("transactions")
          .withIndex("by_organization_project", (q) =>
            q
              .eq("organizationId", user.organizationId)
              .eq("projectId", args.projectId),
          )
      : ctx.db
          .query("transactions")
          .withIndex("by_organization", (q) =>
            q.eq("organizationId", user.organizationId),
          );

    const allTransactions = await query
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "expected"),
          q.neq(q.field("projectId"), undefined),
          q.lt(q.field("amount"), 0),
        ),
      )
      .collect();

    const unmatched = allTransactions.filter((t) => !t.matchedTransactionId);
    const filtered = await filterByProjectAccess(
      ctx,
      user._id,
      user.organizationId,
      unmatched,
    );
    return addProjectAndCategoryNames(ctx, filtered);
  },
});

export const getPaginatedTransactions = query({
  args: {
    projectId: v.optional(v.id("projects")),
    donorId: v.optional(v.id("donors")),
    includeArchived: v.optional(v.boolean()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // different queries for different indexes to maximize performance and minimize data transfer
    const query = args.projectId
      ? ctx.db
          .query("transactions")
          .withIndex("by_organization_project", (q) =>
            q
              .eq("organizationId", user.organizationId)
              .eq("projectId", args.projectId),
          )
      : args.donorId
        ? ctx.db
            .query("transactions")
            .withIndex("by_organization_donor", (q) =>
              q
                .eq("organizationId", user.organizationId)
                .eq("donorId", args.donorId),
            )
        : ctx.db
            .query("transactions")
            .withIndex("by_organization", (q) =>
              q.eq("organizationId", user.organizationId),
            );

    const filteredQuery =
      args.projectId && args.donorId
        ? query.filter((q) => q.eq(q.field("donorId"), args.donorId))
        : query;

    const result = await filteredQuery
      .order("desc")
      .paginate(args.paginationOpts);

    let pageTransactions = result.page;
    if (!args.includeArchived) {
      pageTransactions = pageTransactions.filter((t) => !t.isArchived);
    }
    const filtered = await filterByProjectAccess(
      ctx,
      user._id,
      user.organizationId,
      pageTransactions,
    );
    const page = await addProjectAndCategoryNames(ctx, filtered);

    return {
      isDone: result.isDone,
      continueCursor: result.continueCursor,
      page,
    };
  },
});

export const getTransactionWithSplits = query({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const transaction = await ctx.db.get(args.transactionId);

    if (!transaction) {
      return null;
    }

    if (transaction.organizationId !== user.organizationId) {
      throw new Error("Access denied");
    }

    let splitTransactions = null;
    if (transaction.isArchived) {
      splitTransactions = await ctx.db
        .query("transactions")
        .withIndex("by_splitFrom", (q) =>
          q.eq("splitFromTransactionId", args.transactionId),
        )
        .collect();
    }

    let originalTransaction = null;
    if (transaction.splitFromTransactionId) {
      originalTransaction = await ctx.db.get(
        transaction.splitFromTransactionId,
      );
    }

    return {
      transaction,
      splitTransactions,
      originalTransaction,
      isSplit: transaction.isArchived === true,
      isPartOfSplit: !!transaction.splitFromTransactionId,
    };
  },
});

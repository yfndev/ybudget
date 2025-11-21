import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { filterByProjectAccess } from "../teams/permissions";
import { getCurrentUser } from "../users/getCurrentUser";
import { addProjectAndCategoryNames } from "../utils/addProjectNames";

export const getAllTransactions = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
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

    const transactions = await query
      .filter((q) => q.neq(q.field("isArchived"), true))
      .collect();

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

export const getOldestTransactionDate = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const oldest = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .filter((q) => q.neq(q.field("isArchived"), true))
      .order("asc")
      .first();

    return oldest?.date ?? Date.now();
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
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const hasDateRange = args.startDate !== undefined && args.endDate !== undefined;

    const query = hasDateRange
      ? ctx.db
          .query("transactions")
          .withIndex("by_date", (q) =>
            q.gte("date", args.startDate!).lte("date", args.endDate!),
          )
          .filter((q) => q.eq(q.field("organizationId"), user.organizationId))
      : args.projectId
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

    const filteredQuery = query.filter((q) => {
      const notArchived = q.neq(q.field("isArchived"), true);

      if (args.projectId && hasDateRange) {
        return q.and(notArchived, q.eq(q.field("projectId"), args.projectId));
      }

      if (args.donorId && (hasDateRange || args.projectId)) {
        return q.and(notArchived, q.eq(q.field("donorId"), args.donorId));
      }

      return notArchived;
    });

    const result = await filteredQuery
      .order("desc")
      .paginate(args.paginationOpts);

    const filtered = await filterByProjectAccess(
      ctx,
      user._id,
      user.organizationId,
      result.page,
    );

    return {
      ...result,
      page: await addProjectAndCategoryNames(ctx, filtered),
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

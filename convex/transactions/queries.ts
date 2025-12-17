import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { filterByProjectAccess } from "../teams/permissions";
import { getCurrentUser } from "../users/getCurrentUser";
import { addProjectAndCategoryNames } from "../utils/addProjectAndCategoryNames";

export const getAllTransactions = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) return [];

    const organizationId = user.organizationId;
    const txQuery = args.projectId
      ? ctx.db
          .query("transactions")
          .withIndex("by_organization_project", (q) =>
            q.eq("organizationId", organizationId).eq("projectId", args.projectId),
          )
      : ctx.db
          .query("transactions")
          .withIndex("by_organization", (q) => q.eq("organizationId", organizationId));

    const allTransactions = await txQuery.collect();
    const transactions = allTransactions.filter((t) => !t.isArchived);

    const filtered = await filterByProjectAccess(
      ctx,
      user._id,
      organizationId,
      transactions,
    );

    return addProjectAndCategoryNames(ctx, filtered);
  },
});

export const getUnassignedProcessedTransactions = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin") return [];

    const processed = await ctx.db
      .query("transactions")
      .withIndex("by_organization_status", (q) =>
        q.eq("organizationId", user.organizationId).eq("status", "processed"),
      )
      .collect();

    return processed
      .filter(
        (t) =>
          !t.isArchived &&
          !t.splitFromTransactionId &&
          (!t.projectId || !t.categoryId || (t.amount > 0 && !t.donorId)),
      )
      .sort((a, b) => b.date - a.date);
  },
});

export const getOldestTransactionDate = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .collect();

    const withProject = transactions.filter(
      (t) => t.projectId && !t.isArchived,
    );
    if (withProject.length === 0) return Date.now();

    return Math.min(...withProject.map((t) => t.date));
  },
});

export const getMatchingRecommendations = query({
  args: { projectId: v.optional(v.id("projects")) },
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
          .withIndex("by_organization_status", (q) =>
            q
              .eq("organizationId", user.organizationId)
              .eq("status", "expected"),
          );

    const allTransactions = await query.collect();

    const unmatched = allTransactions.filter(
      (t) =>
        t.projectId &&
        t.amount < 0 &&
        !t.matchedTransactionId &&
        (args.projectId || t.status === "expected"),
    );

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

    let query;
    if (args.projectId) {
      query = ctx.db
        .query("transactions")
        .withIndex("by_organization_project", (q) =>
          q
            .eq("organizationId", user.organizationId)
            .eq("projectId", args.projectId),
        );
    } else if (args.donorId) {
      query = ctx.db
        .query("transactions")
        .withIndex("by_organization_donor", (q) =>
          q
            .eq("organizationId", user.organizationId)
            .eq("donorId", args.donorId),
        );
    } else {
      query = ctx.db
        .query("transactions")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId),
        );
    }

    const result = await query.order("desc").paginate(args.paginationOpts);

    let page = result.page.filter((t) => !t.isArchived);
    if (args.startDate !== undefined && args.endDate !== undefined) {
      page = page.filter(
        (t) => t.date >= args.startDate! && t.date <= args.endDate!,
      );
    }

    const filtered = await filterByProjectAccess(
      ctx,
      user._id,
      user.organizationId,
      page,
    );

    return {
      ...result,
      page: await addProjectAndCategoryNames(ctx, filtered),
    };
  },
});

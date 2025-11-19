import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { filterByProjectAccess } from "../teams/permissions";
import { getCurrentUser } from "../users/getCurrentUser";
import { addProjectAndCategoryNames } from "../utils/addProjectNames";

export const getAllTransactions = query({
  args: { projectId: v.optional(v.id("projects")) },
  handler: async (ctx, args) => {

    const user = await getCurrentUser(ctx);


    // if no projectId is set, it returns all transactions within the org
    const query = args.projectId
      ? ctx.db
          .query("transactions")
          .withIndex("by_organization_project", (q) =>
            q.eq("organizationId", user.organizationId).eq("projectId", args.projectId)
          )
      : ctx.db
          .query("transactions")
          .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId));

    const transactions = await query.collect();
    const filtered = await filterByProjectAccess(ctx, user._id, user.organizationId, transactions);
    return addProjectAndCategoryNames(ctx, filtered);
  },
});

export const getUnassignedProcessedTransactions = query({
  handler: async (ctx) => {


    const user = await getCurrentUser(ctx);
    if (user.role !== "admin") return [];

    const allTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
      .collect();

    const unassigned = allTransactions.filter((t) => {
      if (t.status !== "processed") return false;
      if (!t.projectId) return true;
      if (!t.categoryId) return true;
      if (t.amount > 0 && !t.donorId) return true;
      return false;
    });

    return unassigned.sort((a, b) => b.date - a.date);
  },
});

export const getTransactionRecommendations = query({
  args: { amount: v.number(), projectId: v.optional(v.id("projects")) },
  handler: async (ctx, args) => {

    const user = await getCurrentUser(ctx);

    const allTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization_project", (q) => q.eq("organizationId", user.organizationId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "expected"),
          q.neq(q.field("projectId"), undefined),
          q.lt(q.field("amount"), 0)
        )
      )
      .collect();

    const unmatched = allTransactions.filter((t) => !t.matchedTransactionId);
    const filtered = await filterByProjectAccess(ctx, user._id, user.organizationId, unmatched);
    return addProjectAndCategoryNames(ctx, filtered);
  },
});

export const getPaginatedTransactions = query({
  args: {
    projectId: v.optional(v.id("projects")),
    donorId: v.optional(v.id("donors")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {

    const user = await getCurrentUser(ctx);

    // different queries for different indexes to maximize performance and minimize data transfer
    const query = args.projectId
      ? ctx.db
          .query("transactions")
          .withIndex("by_organization_project", (q) =>
            q.eq("organizationId", user.organizationId).eq("projectId", args.projectId)
          )
      : args.donorId
        ? ctx.db
            .query("transactions")
            .withIndex("by_organization_donor", (q) =>
              q.eq("organizationId", user.organizationId).eq("donorId", args.donorId)
            )
        : ctx.db
            .query("transactions")
            .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId));

    const filteredQuery =
      args.projectId && args.donorId
        ? query.filter((q) => q.eq(q.field("donorId"), args.donorId))
        : query;

    const result = await filteredQuery.order("desc").paginate(args.paginationOpts);
    const filtered = await filterByProjectAccess(ctx, user._id, user.organizationId, result.page);
    const page = await addProjectAndCategoryNames(ctx, filtered);

    return {
      isDone: result.isDone,
      continueCursor: result.continueCursor,
      page,
    };
  },
});

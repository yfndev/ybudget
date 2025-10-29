import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedUser } from "../utils/auth";
import { createCategoryMap } from "../utils/categoryMapping";

export const getTransactions = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    projectId: v.optional(v.string()),
    status: v.optional(v.union(v.literal("processed"), v.literal("expected"))),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    let query = ctx.db
      .query("transactions")
      .withIndex("by_organization_date", (q) =>
        q
          .eq("organizationId", user.organizationId)
          .gte("date", args.startDate)
          .lte("date", args.endDate)
      )
      .filter((q) => q.neq(q.field("projectId"), ""));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const transactions = await query.collect();

    const projects = await ctx.db.query("projects").collect();
    const projectMap = new Map(projects.map(p => [p._id.toString(), p.name]));
    const categoryMap = createCategoryMap();

    let filtered = transactions;
    if (args.projectId) {
      filtered = transactions.filter(t => t.projectId === args.projectId);
    }

    return filtered.map(t => ({
      ...t,
      projectName: projectMap.get(t.projectId) || t.projectId,
      categoryName: categoryMap.get(t.categoryId) || t.categoryId,
    }));
  },
});

export const getAllTransactions = query({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
      .collect();
  },
});

export const getUnassignedProcessedTransactions = query({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
      .filter(q => q.and(
        q.eq(q.field("status"), "processed"),
        q.eq(q.field("projectId"), "")
      ))
      .collect();


    const unassignedTransactions = transactions.filter(
      (t) => !t.matchedTransactionId || t.matchedTransactionId === ""
    );

    const categoryMap = createCategoryMap();

    return unassignedTransactions.map(t => ({
      ...t,
      categoryName: categoryMap.get(t.categoryId) || t.categoryId,
    }));
  },
});

export const getImportedTransactionIds = query({
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
      .collect();

    return transactions
      .map((t) => t.importedTransactionId)
      .filter((id): id is string => id !== undefined && id !== "");
  },
});



export const getTransactionRecommendations = query({
  args: {
    amount: v.number(),
    projectId: v.optional(v.string()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    let query = ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "expected"),
          q.neq(q.field("projectId"), "")
        )
      );

    const transactions = await query.collect();

    const unmatched = transactions.filter(
      (t) => !t.matchedTransactionId || t.matchedTransactionId === ""
    );

    const projects = await ctx.db.query("projects").collect();
    const projectMap = new Map(projects.map((p) => [p._id.toString(), p.name]));

    return unmatched.map((transaction) => ({
      ...transaction,
      projectName: projectMap.get(transaction.projectId) || transaction.projectId,
    }));
  },
});
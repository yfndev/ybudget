import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getBudgetsByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.organizationId !== user.organizationId) {
      throw new Error("Access denied");
    }
    return ctx.db
      .query("budgets")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const getBudgetsBySourceTransaction = query({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction || transaction.organizationId !== user.organizationId) {
      throw new Error("Access denied");
    }
    return ctx.db
      .query("budgets")
      .withIndex("by_source_transaction", (q) =>
        q.eq("sourceTransactionId", args.transactionId),
      )
      .collect();
  },
});

export const getDepartmentProjects = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return ctx.db
      .query("projects")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .filter((q) => q.eq(q.field("parentId"), undefined))
      .collect();
  },
});

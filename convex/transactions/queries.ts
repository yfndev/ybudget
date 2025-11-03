import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

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
            q.eq("organizationId", user.organizationId).eq("projectId", args.projectId!)
          )
      : ctx.db
          .query("transactions")
          .withIndex("by_organization", (q) =>
            q.eq("organizationId", user.organizationId)
          );
    return await query.collect();
  },
});

export const getUnassignedProcessedTransactions = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    return await ctx.db
      .query("transactions")
      .withIndex("by_organization_project", (q) =>
        q.eq("organizationId", user.organizationId).eq("projectId", undefined)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "processed"),
          q.eq(q.field("projectId"), undefined)
        )
      )
      .collect();
  },
});

export const getTransactionRecommendations = query({
  args: {
    amount: v.number(),
    projectId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    return await ctx.db
      .query("transactions")
      .withIndex("by_organization_project", (q) =>
        q.eq("organizationId", user.organizationId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "expected"),
          q.neq(q.field("projectId"), undefined),
          q.lt(q.field("amount"), 0)
        )
      )
      .collect();

    
  },
});
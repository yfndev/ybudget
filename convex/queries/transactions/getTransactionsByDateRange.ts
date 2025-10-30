import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";
import { createCategoryMap } from "../../utils/categoryMapping";

export const getTransactionsByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    projectId: v.optional(v.string()),
    status: v.optional(v.union(v.literal("processed"), v.literal("expected"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
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









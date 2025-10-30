import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getAuthenticatedUser } from "../../utils/auth";

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
            q.neq(q.field("projectId"), ""),
            q.lt(q.field("amount"), 0)
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
    import { query } from "../../_generated/server";
import { getAuthenticatedUser } from "../../utils/auth";
import { createCategoryMap } from "../../utils/categoryMapping";

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
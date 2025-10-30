import { query } from "../../_generated/server";
import { getAuthenticatedUser } from "../../utils/auth";

export const getTransactionsByDateRange = query({
    handler: async (ctx) => {
      const user = await getAuthenticatedUser(ctx);
      if (!user) return [];
  
      return await ctx.db
        .query("transactions")
        .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
        .collect();
    },
  });
  
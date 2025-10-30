import { query } from "../../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getTransactionsByDateRange = query({
    handler: async (ctx) => {
      const user = await getCurrentUser(ctx);
      if (!user) return [];
  
      return await ctx.db
        .query("transactions")
        .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
        .collect();
    },
  });
  
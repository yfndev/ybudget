import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

        export const getImportedTransactionIds = query({
    returns: v.array(v.string()),
    handler: async (ctx) => {
      const user = await getCurrentUser(ctx);
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
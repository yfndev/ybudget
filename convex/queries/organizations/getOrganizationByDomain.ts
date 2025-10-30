import { v } from "convex/values";
import { query } from "../../_generated/server";

export const getOrganizationByDomain = query({
    args: { domain: v.string() },
    handler: async (ctx, args) => {
      const organization = await ctx.db
        .query("organizations")
        .withIndex("by_domain", (q) => q.eq("domain", args.domain))
        .first();
  
      return organization;
    },
  });
  
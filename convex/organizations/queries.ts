import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getOrganizationName = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const organization = await ctx.db.get(user.organizationId);
    return organization?.name;
  },
});

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

export const getUserOrganization = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db.get(user.organizationId);
  },
});
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

export const getUserOrganization = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db.get(user.organizationId);
  },
});

export const checkOrganizationExistsByUserDomain = query({
  args: {},
  returns: v.union(
    v.object({
      exists: v.literal(true),
      organizationName: v.string(),
    }),
    v.object({
      exists: v.literal(false),
    })
  ),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    
    if (!user.email) {
      return { exists: false as const };
    }

    const domain = user.email.split("@")[1];
    if (!domain) {
      return { exists: false as const };
    }

    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_domain", (q) => q.eq("domain", domain))
      .first();

    if (organization) {
      return {
        exists: true as const,
        organizationName: organization.name,
      };
    }

    return { exists: false as const };
  },
});
import { v } from "convex/values";
import { internalQuery, query } from "../_generated/server";
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
    }),
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

export const getOrganizationById = internalQuery({
  args: { organizationId: v.id("organizations") },
  returns: v.union(
    v.object({
      _id: v.id("organizations"),
      _creationTime: v.number(),
      name: v.string(),
      domain: v.string(),
      createdBy: v.string(),
      subscriptionStatus: v.optional(
        v.union(
          v.literal("trial"),
          v.literal("active"),
          v.literal("canceled"),
          v.literal("expired"),
        ),
      ),
      subscriptionTier: v.optional(
        v.union(v.literal("monthly"), v.literal("yearly")),
      ),
      stripeCustomerId: v.optional(v.string()),
      stripeSubscriptionId: v.optional(v.string()),
      trialEndsAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});

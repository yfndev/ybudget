import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

const FREE_TIER_LIMIT = 3;

export const getProjectLimits = query({
  args: {},
  returns: v.object({
    currentProjects: v.number(),
    maxProjects: v.union(v.number(), v.null()),
    canCreateMore: v.boolean(),
    isPremium: v.boolean(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        currentProjects: 0,
        maxProjects: FREE_TIER_LIMIT,
        canCreateMore: false,
        isPremium: false,
      };
    }

    const user = await ctx.db.get(userId);
    if (!user || !user.organizationId) {
      return {
        currentProjects: 0,
        maxProjects: FREE_TIER_LIMIT,
        canCreateMore: false,
        isPremium: false,
      };
    }

    const organizationId = user.organizationId;
    const organization = await ctx.db.get(organizationId);
    const isPremium = organization?.subscriptionStatus === "active";

    const projectCount = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
      .collect();

    const currentProjects = projectCount.length;

    return {
      currentProjects,
      maxProjects: isPremium ? null : FREE_TIER_LIMIT,
      canCreateMore: isPremium || currentProjects < FREE_TIER_LIMIT,
      isPremium,
    };
  },
});

export const getOrganizationPayments = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("payments"),
      _creationTime: v.number(),
      tier: v.union(v.literal("monthly"), v.literal("yearly")),
      status: v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed"),
      ),
      paidAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (!user.organizationId) {
      return [];
    }

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .collect();

    return payments.map((p) => ({
      _id: p._id,
      _creationTime: p._creationTime,
      tier: p.tier,
      status: p.status,
      paidAt: p.paidAt,
    }));
  },
});

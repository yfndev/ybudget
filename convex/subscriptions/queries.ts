import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getSubscriptionStatus = query({
  args: {},
  returns: v.object({
    status: v.union(
      v.literal("trial"),
      v.literal("active"),
      v.literal("canceled"),
      v.literal("expired"),
      v.literal("no_subscription"),
    ),
    hasAccess: v.boolean(),
    tier: v.optional(v.union(v.literal("monthly"), v.literal("yearly"))),
    trialEndsAt: v.optional(v.number()),
    daysLeftInTrial: v.optional(v.number()),
  }),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (!user.organizationId) {
      return {
        status: "no_subscription" as const,
        hasAccess: false,
      };
    }

    const organization = await ctx.db.get(user.organizationId);

    if (!organization) {
      return {
        status: "no_subscription" as const,
        hasAccess: false,
      };
    }

    const now = Date.now();
    const trialEndsAt =
      organization.trialEndsAt ||
      organization._creationTime + 14 * 24 * 60 * 60 * 1000;
    const daysLeftInTrial = Math.max(
      0,
      Math.ceil((trialEndsAt - now) / (24 * 60 * 60 * 1000)),
    );

    const subscriptionStatus = organization.subscriptionStatus || "trial";

    let hasAccess = false;
    if (subscriptionStatus === "active") {
      hasAccess = true;
    } else if (subscriptionStatus === "trial") {
      hasAccess = now < trialEndsAt;
    }

    return {
      status: hasAccess
        ? subscriptionStatus
        : subscriptionStatus === "trial"
          ? "expired"
          : subscriptionStatus,
      hasAccess,
      tier: organization.subscriptionTier,
      trialEndsAt,
      daysLeftInTrial:
        subscriptionStatus === "trial" ? daysLeftInTrial : undefined,
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

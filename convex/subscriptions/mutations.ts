import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const initializeTrial = internalMutation({
  args: {
    organizationId: v.id("organizations"),
  },
  returns: v.null(),
  handler: async (ctx, { organizationId }) => {
    const trialEndsAt = Date.now() + 14 * 24 * 60 * 60 * 1000;

    await ctx.db.patch(organizationId, {
      subscriptionStatus: "trial" as const,
      trialEndsAt,
    });

    return null;
  },
});

export const cancelSubscription = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { stripeSubscriptionId }) => {
    const organization = await ctx.db
      .query("organizations")
      .filter((q) =>
        q.eq(q.field("stripeSubscriptionId"), stripeSubscriptionId),
      )
      .first();

    if (!organization) {
      throw new Error("Organization not found");
    }

    await ctx.db.patch(organization._id, {
      subscriptionStatus: "canceled" as const,
    });

    return null;
  },
});

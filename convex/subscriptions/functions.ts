import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

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

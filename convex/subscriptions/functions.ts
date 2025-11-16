import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const cancelSubscription = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { stripeSubscriptionId }) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", stripeSubscriptionId),
      )
      .first();

    if (!payment) {
      throw new Error("Payment not found");
    }

    await ctx.db.patch(payment._id, {
      status: "canceled" as const,
    });

    return null;
  },
});

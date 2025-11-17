import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { internalMutation } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const create = internalMutation({
  args: { tier: v.union(v.literal("monthly"), v.literal("yearly")) },
  returns: v.id("payments"),
  handler: async (ctx, { tier }) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db.insert("payments", {
      tier,
      organizationId: user.organizationId as Id<"organizations">,
      status: "pending" as const,
    });
  },
});

export const markPending = internalMutation({
  args: {
    paymentId: v.id("payments"),
    stripeId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { paymentId, stripeId }) => {
    await ctx.db.patch(paymentId, { stripeSessionId: stripeId });
    return null;
  },
});

export const fulfill = internalMutation({
  args: {
    stripeSessionId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
  },
  returns: v.null(),
  handler: async (
    { db },
    { stripeSessionId, stripeCustomerId, stripeSubscriptionId },
  ) => {
    const payment = await db
      .query("payments")
      .withIndex("by_stripeSessionId", (q) =>
        q.eq("stripeSessionId", stripeSessionId),
      )
      .unique();

    if (!payment) {
      throw new Error("Payment not found");
    }

    await db.patch(payment._id, {
      status: "completed" as const,
      stripeCustomerId,
      stripeSubscriptionId,
      paidAt: Date.now(),
    });

    return null;
  },
});

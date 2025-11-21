"use node";

import { v } from "convex/values";
import Stripe from "stripe";
import { api, internal } from "./_generated/api";
import { action, internalAction } from "./_generated/server";

const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const getTiers = () => {
  const isProduction = process.env.STRIPE_KEY!.startsWith("sk_live_");
  return isProduction
    ? {
        monthly: "price_1SSD0wRxVFqrremh8GocLXsZ",
        yearly: "price_1SSD1hRxVFqrremh6nN2Efli",
      }
    : {
        monthly: "price_1SSMc2RucjQoYr9Aq0Ga4SvT",
        yearly: "price_1SSMcGRucjQoYr9AGbAuLfxq",
      };
};

export const pay = action({
  args: { tier: v.union(v.literal("monthly"), v.literal("yearly")) },
  handler: async (ctx, args): Promise<string> => {
    const user = await ctx.runQuery(api.users.queries.getCurrentUserProfile);
    if (!user) {
      throw new Error("User not found");
    }

    const domain = process.env.HOSTING_URL ?? "http://localhost:3000";
    const paymentId = await ctx.runMutation(
      internal.payments.functions.create,
      { tier: args.tier },
    );
    const priceId = getTiers()[args.tier];

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      metadata: { userId: user._id },
      mode: "subscription",
      success_url: `${domain}?paymentId=${paymentId}`,
      cancel_url: domain,
      automatic_tax: { enabled: true },
    });

    await ctx.runMutation(internal.payments.functions.markPending, {
      paymentId,
      stripeId: session.id,
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session");
    }

    return session.url;
  },
});

export const createCustomerPortalSession = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const user = await ctx.runQuery(api.users.queries.getCurrentUserProfile);
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.organizationId) {
      throw new Error("No organization found for user");
    }

    const payment = await ctx.runQuery(
      internal.payments.queries.getActivePayment,
      { organizationId: user.organizationId },
    );
    if (!payment) {
      throw new Error("No active payment found for organization");
    }
    if (!payment.stripeCustomerId) {
      throw new Error("No Stripe customer ID found for payment");
    }

    const domain = process.env.HOSTING_URL ?? "http://localhost:3000";
    const session = await stripe.billingPortal.sessions.create({
      customer: payment.stripeCustomerId,
      return_url: `${domain}/dashboard`,
    });

    return session.url;
  },
});

export const fulfill = internalAction({
  args: { signature: v.string(), payload: v.string() },
  handler: async (ctx, { signature, payload }) => {
    const webhookSecret = process.env.STRIPE_WEBHOOKS_SECRET!;

    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        await ctx.runMutation(internal.payments.functions.fulfill, {
          stripeSessionId: session.id,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        });
      }

      if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object;
        await ctx.runMutation(
          internal.subscriptions.functions.cancelSubscription,
          { stripeSubscriptionId: subscription.id },
        );
      }

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  },
});

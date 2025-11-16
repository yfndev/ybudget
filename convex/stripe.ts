"use node";

import { v } from "convex/values";
import Stripe from "stripe";
import { internal } from "./_generated/api";
import { action, internalAction } from "./_generated/server";

const getTiers = (stripeKey: string) => {
  const isProduction = stripeKey.startsWith("sk_live_");

  if (isProduction) {
    return {
      monthly: "price_1SSD0wRxVFqrremh8GocLXsZ",
      yearly: "price_1SSD1hRxVFqrremh6nN2Efli",
    };
  }

  return {
    monthly: "price_1SSMc2RucjQoYr9Aq0Ga4SvT",
    yearly: "price_1SSMcGRucjQoYr9AGbAuLfxq",
  };
};

export const pay = action({
  args: { tier: v.union(v.literal("monthly"), v.literal("yearly")) },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args): Promise<string | null> => {
    const user: any = await ctx.runQuery(
      internal.users.queries.getCurrentUserInternal,
    );
    const domain = process.env.HOSTING_URL ?? "http://localhost:3000";
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2025-10-29.clover",
    });

    const paymentId: any = await ctx.runMutation(
      internal.payments.functions.create,
      {
        tier: args.tier,
      },
    );
    const tiers = getTiers(process.env.STRIPE_KEY!);
    const priceId = tiers[args.tier];

    const session: any = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      metadata: { userId: user._id },
      mode: "subscription",
      success_url: `${domain}?paymentId=${paymentId}`,
      cancel_url: `${domain}`,
      automatic_tax: { enabled: true },
    });

    await ctx.runMutation(internal.payments.functions.markPending, {
      paymentId,
      stripeId: session.id,
    });

    return session.url;
  },
});

export const createCustomerPortalSession = action({
  args: {},
  returns: v.string(),
  handler: async (ctx): Promise<string> => {
    const user: any = await ctx.runQuery(
      internal.users.queries.getCurrentUserInternal,
    );

    if (!user.organizationId) {
      throw new Error("No organization found for user");
    }

    const payment: any = await ctx.runQuery(
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
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2025-10-29.clover",
    });

    const session = await stripe.billingPortal.sessions.create({
      customer: payment.stripeCustomerId,
      return_url: `${domain}/dashboard`,
    });

    return session.url;
  },
});

export const fulfill = internalAction({
  args: { signature: v.string(), payload: v.string() },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, { signature, payload }) => {
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2025-10-29.clover",
    });
    const webhookSecret = process.env.STRIPE_WEBHOOKS_SECRET as string;

    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        await ctx.runMutation(internal.payments.functions.fulfill, {
          stripeSessionId: session.id,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
        });
      }

      if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as any;
        await ctx.runMutation(
          internal.subscriptions.functions.cancelSubscription,
          {
            stripeSubscriptionId: subscription.id,
          },
        );
      }

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  },
});

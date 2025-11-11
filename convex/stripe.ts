// convex/stripe.ts

// This pragma is important because Stripe's SDK currently
// only works in the Node Runtime
"use node";

import { v } from "convex/values";
import Stripe from "stripe";
import { internal } from "./_generated/api";
import { action, internalAction } from "./_generated/server";

const tiers = {
    monthly: "prod_TP13n1BAty9Dse",
    yearly: "prod_TP13BNSIoXI7Sy",
}

export const pay = action({
  // The action takes the message the user composed
  args: { tier: v.union(v.literal("monthly"), v.literal("yearly")) },
  handler: async (ctx,  args) => {
    const user = await ctx.runQuery(internal.users.queries.getCurrentUserInternal); 
    
    // We need to tell Stripe where to redirect to
    const domain = process.env.HOSTING_URL ?? "http://localhost:5173";
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2025-10-29.clover",
    });
    // Here we create a document in the "payments" table
    const paymentId = await ctx.runMutation(internal.payments.create, { tier: args.tier });
    // This is where the Stripe checkout is configured
   const priceId = tiers[args.tier];

    const session = await stripe.checkout.sessions.create({
      line_items: [{price: priceId, quantity: 1}],
       
    customer_email: user.email,
    metadata: {userId: user._id},
    mode: "subscription",

      // This is how our web page will know which message we paid for
      success_url: `${domain}?paymentId=${paymentId}`,
      cancel_url: `${domain}`,
      automatic_tax: { enabled: true },
    });

    // Keep track of the checkout session ID for fulfillment
    await ctx.runMutation(internal.payments.markPending, {
      paymentId,
      stripeId: session.id,
    });
    // Let the client know the Stripe URL to redirect to
    return session.url;
  },
});

export const fulfill = internalAction({
    args: { signature: v.string(), payload: v.string() },
    handler: async (ctx, { signature, payload }) => {
      const stripe = new Stripe(process.env.STRIPE_KEY!, {
        apiVersion: "2025-10-29.clover",
      });
  
      const webhookSecret = process.env.STRIPE_WEBHOOKS_SECRET as string;
      try {
        // This call verifies the request
        const event = stripe.webhooks.constructEvent(
          payload,
          signature,
          webhookSecret
        );
        if (event.type === "checkout.session.completed") {
          const stripeId = (event.data.object as { id: string }).id;
          // Send the message and mark the payment as fulfilled
          await ctx.runMutation(internal.payments.fulfill, { stripeId });
        }
        return { success: true };
      } catch (err) {
        console.error(err);
        return { success: false };
      }
    },
  });
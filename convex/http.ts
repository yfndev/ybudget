import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Getting the stripe-signature header
    const signature: string = request.headers.get("stripe-signature") as string;
    // Calling the action that will perform our fulfillment
    const result = await ctx.runAction(internal.stripe.fulfill, {
      signature,
      payload: await request.text(),
    });
    if (result.success) {
      // We make sure to confirm the successful processing
      // so that Stripe can stop sending us the confirmation
      // of this payment.
      return new Response(null, {
        status: 200,
      });
    } else {
      // If something goes wrong Stripe will continue repeating
      // the same webhook request until we confirm it.
      return new Response("Webhook Error", {
        status: 400,
      });
    }
  }),
});

export default http;

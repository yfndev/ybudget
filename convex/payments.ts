// convex/payments.ts

import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import { getCurrentUser } from "./users/getCurrentUser";

export const create = internalMutation({
    
    args: { tier: v.union(v.literal("monthly"), v.literal("yearly")) },
    handler: async (ctx, { tier }) => {
      const user = await getCurrentUser(ctx);
      return await ctx.db.insert("payments", { tier, organizationId: user.organizationId as Id<"organizations"> });
  },
});

export const markPending = internalMutation({
  args: {
    paymentId: v.id("payments"),
    stripeId: v.string(),
  },
  handler: async (ctx, { paymentId, stripeId }) => {
    await ctx.db.patch(paymentId, { stripeId });
  },
});


export const fulfill = internalMutation({
    args: { stripeId: v.string() },
    handler: async ({ db }, { stripeId }) => {
      const { _id: paymentId } = (await db
        .query("payments")
        .withIndex("by_stripeId", (q) => q.eq("stripeId", stripeId))       
        .unique())!;
      await db.patch(paymentId, { stripeId });
    },
  });
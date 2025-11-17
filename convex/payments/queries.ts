import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

export const getActivePayment = internalQuery({
  args: { organizationId: v.id("organizations") },
  returns: v.union(
    v.object({
      _id: v.id("payments"),
      _creationTime: v.number(),
      tier: v.union(v.literal("monthly"), v.literal("yearly")),
      status: v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("canceled"),
      ),
      organizationId: v.id("organizations"),
      stripeSessionId: v.optional(v.string()),
      stripeCustomerId: v.optional(v.string()),
      stripeSubscriptionId: v.optional(v.string()),
      paidAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .first();
  },
});

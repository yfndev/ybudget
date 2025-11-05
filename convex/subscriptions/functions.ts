import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { getCurrentUser } from "../users/getCurrentUser";

const TRIAL_DAYS = 14;

export const startTrial = mutation({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .first();

    if (existing) return existing._id;

    const now = Date.now();
    const trialEndDate = now + TRIAL_DAYS * 24 * 60 * 60 * 1000;

    return await ctx.db.insert("subscriptions", {
      organizationId: args.organizationId,
      status: "trial",
      trialStartDate: now,
      trialEndDate,
      plan: "starter",
    });
  },
});

export const getSubscription = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .first();
  },
});

export const getCurrentSubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user.organizationId) return null;

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .first();

    if (!subscription) return null;

    const now = Date.now();

    // Check if trial is expired (don't auto-patch in query)
    if (
      subscription.status === "trial" &&
      subscription.trialEndDate &&
      now > subscription.trialEndDate
    ) {
      return { ...subscription, status: "expired" as const };
    }

    return subscription;
  },
});

export const checkSubscriptionAccess = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user.organizationId) {
      return {
        hasAccess: false,
        reason: "no_organization" as const,
      };
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .first();

    if (!subscription) {
      return {
        hasAccess: false,
        reason: "no_subscription" as const,
      };
    }

    const now = Date.now();

    if (subscription.status === "trial") {
      if (subscription.trialEndDate && now > subscription.trialEndDate) {
        return {
          hasAccess: false,
          reason: "trial_expired" as const,
          subscription,
        };
      }
      return {
        hasAccess: true,
        reason: "trial" as const,
        subscription,
        daysRemaining: subscription.trialEndDate
          ? Math.ceil((subscription.trialEndDate - now) / (24 * 60 * 60 * 1000))
          : 0,
      };
    }

    if (subscription.status === "active") {
      return {
        hasAccess: true,
        reason: "active" as const,
        subscription,
      };
    }

    return {
      hasAccess: false,
      reason: "expired" as const,
      subscription,
    };
  },
});

export const expireTrialIfNeeded = mutation({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .first();

    if (!subscription) return;

    const now = Date.now();
    if (
      subscription.status === "trial" &&
      subscription.trialEndDate &&
      now > subscription.trialEndDate
    ) {
      await ctx.db.patch(subscription._id, { status: "expired" });
    }
  },
});

export const upgradeToProSubscription = mutation({
  args: {
    polarSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user.organizationId) throw new Error("No organization");

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .first();

    if (!subscription) throw new Error("No subscription found");

    await ctx.db.patch(subscription._id, {
      status: "active",
      polarSubscriptionId: args.polarSubscriptionId,
      plan: "professional",
      subscriptionStartDate: Date.now(),
    });

    return subscription._id;
  },
});

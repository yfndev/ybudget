import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { createAccount } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { internalQuery, mutation, type MutationCtx } from "../_generated/server";

export const TestingCredentials = ConvexCredentials({
  id: "testing",
  authorize: async (credentials, ctx): Promise<{ userId: Id<"users"> }> => {
    if (!process.env.IS_TEST) throw new ConvexError("Testing provider is only available in test environment");

    const email = credentials.email as string | undefined;
    if (!email) throw new ConvexError("Email is required for testing authentication");

    const { user } = await createAccount(ctx, {
      provider: "testing",
      account: { id: email },
      profile: { email, name: (credentials.name as string) ?? "Test User", emailVerificationTime: Date.now() },
      shouldLinkViaEmail: true,
    });

    return { userId: user._id as Id<"users"> };
  },
});

async function deleteByOrganization(
  ctx: MutationCtx,
  table: "transactions" | "projects" | "donors" | "logs" | "payments",
  organizationId: Id<"organizations">,
) {
  const docs = await ctx.db.query(table).withIndex("by_organization", (q) => q.eq("organizationId", organizationId)).collect();
  for (const doc of docs) await ctx.db.delete(doc._id);
}

export const clearTestData = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    if (!process.env.IS_TEST) throw new ConvexError("Only available in test environment");

    const deletedIds = { accounts: new Set<string>(), sessions: new Set<string>() };

    const accounts = await ctx.db.query("authAccounts").withIndex("providerAndAccountId", (q) => q.eq("provider", "testing").eq("providerAccountId", email)).collect();
    for (const account of accounts) {
      const sessions = await ctx.db.query("authSessions").withIndex("userId", (q) => q.eq("userId", account.userId)).collect();
      for (const session of sessions) {
        if (!deletedIds.sessions.has(session._id)) {
          await ctx.db.delete(session._id);
          deletedIds.sessions.add(session._id);
        }
      }
      await ctx.db.delete(account._id);
      deletedIds.accounts.add(account._id);
    }

    const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).unique();
    if (!user) return;

    const organizationId = user.organizationId;
    if (organizationId) {
      for (const table of ["transactions", "projects", "donors", "logs", "payments"] as const) {
        await deleteByOrganization(ctx, table, organizationId);
      }
      const org = await ctx.db.get(organizationId);
      if (org) await ctx.db.delete(organizationId);
    }

    const sessions = await ctx.db.query("authSessions").withIndex("userId", (q) => q.eq("userId", user._id)).collect();
    for (const session of sessions) {
      if (!deletedIds.sessions.has(session._id)) await ctx.db.delete(session._id);
    }

    const userAccounts = await ctx.db.query("authAccounts").withIndex("userIdAndProvider", (q) => q.eq("userId", user._id)).collect();
    for (const account of userAccounts) {
      if (!deletedIds.accounts.has(account._id)) await ctx.db.delete(account._id);
    }

    await ctx.db.delete(user._id);
  },
});

export const getSubscriptionIdByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).unique();
    const organizationId = user?.organizationId;
    if (!organizationId) return null;

    const payment = await ctx.db.query("payments").withIndex("by_organization", (q) => q.eq("organizationId", organizationId)).first();
    return payment?.stripeSubscriptionId ?? null;
  },
});

export const createMockPayment = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    if (!process.env.IS_TEST) throw new ConvexError("Only available in test environment");

    const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).unique();
    if (!user?.organizationId) throw new ConvexError("User not found");

    await ctx.db.insert("payments", {
      tier: "yearly",
      status: "completed",
      organizationId: user.organizationId,
      stripeSessionId: `test_session_${Date.now()}`,
      stripeCustomerId: `test_customer_${Date.now()}`,
      stripeSubscriptionId: `test_subscription_${Date.now()}`,
      paidAt: Date.now(),
    });
  },
});

export const createMockProjects = mutation({
  args: { email: v.string(), count: v.number() },
  handler: async (ctx, { email, count }) => {
    if (!process.env.IS_TEST) throw new ConvexError("Only available in test environment");

    const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).unique();
    if (!user?.organizationId) throw new ConvexError("User not found");

    for (let i = 0; i < count; i++) {
      await ctx.db.insert("projects", {
        name: `Test Project ${i + 1}`,
        organizationId: user.organizationId,
        isArchived: false,
        createdBy: user._id,
      });
    }
  },
});

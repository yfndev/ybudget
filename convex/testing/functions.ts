import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { createAccount } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";
import { mutation, type MutationCtx } from "../_generated/server";
import { ConvexError, v } from "convex/values";

export const TestingCredentials = ConvexCredentials({
  id: "testing",
  authorize: async (credentials, ctx): Promise<{ userId: Id<"users"> }> => {
    if (!process.env.IS_TEST)
      throw new ConvexError("Testing provider is only available in test environment");

    const email = credentials.email as string | undefined;
    if (!email)
      throw new ConvexError("Email is required for testing authentication");

    const { user } = await createAccount(ctx, {
      provider: "testing",
      account: { id: email },
      profile: {
        email,
        name: (credentials.name as string) ?? "Test User",
        emailVerificationTime: Date.now(),
      },
      shouldLinkViaEmail: true,
    });

    return { userId: user._id as Id<"users"> };
  },
});

async function deleteByOrganization(
  ctx: MutationCtx,
  table: "transactions" | "projects" | "donors" | "logs",
  organizationId: Id<"organizations">,
) {
  const docs = await ctx.db
    .query(table)
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .collect();

  for (const doc of docs) {
    await ctx.db.delete(doc._id);
  }
}

export const clearTestData = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.IS_TEST)
      throw new ConvexError("Only available in test environment");

    // Delete orphaned authAccounts by providerAccountId (email)
    const orphanedAccounts = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", "testing").eq("providerAccountId", args.email)
      )
      .collect();
    for (const account of orphanedAccounts) {
      // Delete sessions for this account's user
      const sessions = await ctx.db
        .query("authSessions")
        .withIndex("userId", (q) => q.eq("userId", account.userId))
        .collect();
      for (const session of sessions) {
        await ctx.db.delete(session._id);
      }
      await ctx.db.delete(account._id);
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) return;

    if (user.organizationId) {
      await deleteByOrganization(ctx, "transactions", user.organizationId);
      await deleteByOrganization(ctx, "projects", user.organizationId);
      await deleteByOrganization(ctx, "donors", user.organizationId);
      await deleteByOrganization(ctx, "logs", user.organizationId);
      await ctx.db.delete(user.organizationId);
    }

    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    const accounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", user._id))
      .collect();
    for (const account of accounts) {
      await ctx.db.delete(account._id);
    }

    await ctx.db.delete(user._id);
  },
});

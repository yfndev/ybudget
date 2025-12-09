import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import type { Id } from "../_generated/dataModel";
import { ConvexError } from "convex/values";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation, mutation, type MutationCtx } from "../_generated/server";

export const TestingCredentials = ConvexCredentials({
  id: "testing",
  authorize: async (credentials, ctx): Promise<{ userId: Id<"users"> } | null> => {
    if (!process.env.IS_TEST)
      throw new ConvexError("Testing provider is only available in test environment");

    const email = credentials.email as string | undefined;
    if (!email)
      throw new ConvexError("Email is required for testing authentication");

    const userId = await ctx.runMutation(
      internal.testing.functions.findOrCreateTestUser,
      { email, name: credentials.name as string | undefined },
    );

    return { userId };
  },
});

export const findOrCreateTestUser = internalMutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) return existingUser._id;

    return ctx.db.insert("users", {
      email: args.email,
      name: args.name ?? "Test User",
      emailVerificationTime: Date.now(),
    });
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

    await ctx.db.delete(user._id);
  },
});

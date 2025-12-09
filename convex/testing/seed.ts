import { ConvexError, v } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import { mutation } from "../_generated/server";

async function getUserAndOrg(ctx: MutationCtx, email: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", email))
    .unique();

  if (!user || !user.organizationId)
    throw new ConvexError("User or organization not found");

  return { userId: user._id, organizationId: user.organizationId };
}

export const seedTestTransactions = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.IS_TEST)
      throw new ConvexError("Only available in test environment");

    const { userId, organizationId } = await getUserAndOrg(ctx, args.email);

    const existingSpenden = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("name"), "Spenden"))
      .first();

    if (!existingSpenden) {
      let einnahmenId = (
        await ctx.db
          .query("categories")
          .filter((q) => q.eq(q.field("name"), "Einnahmen"))
          .first()
      )?._id;

      if (!einnahmenId) {
        einnahmenId = await ctx.db.insert("categories", {
          name: "Einnahmen",
          taxsphere: "non-profit",
          approved: true,
        });
      }

      await ctx.db.insert("categories", {
        name: "Spenden",
        taxsphere: "non-profit",
        approved: true,
        parentId: einnahmenId,
      });
    }

    const project = await ctx.db.insert("projects", {
      organizationId,
      name: "Test Projekt",
      description: "",
      isArchived: false,
      createdBy: userId,
    });

    const now = Date.now();

    const processed1 = await ctx.db.insert("transactions", {
      organizationId,
      amount: -100,
      date: now + 3000,
      counterparty: "Test Empfänger",
      importedBy: userId,
      status: "processed",
      description: "Processed 1",
    });

    const processed2 = await ctx.db.insert("transactions", {
      organizationId,
      amount: -100,
      date: now + 2000,
      counterparty: "Test Empfänger",
      importedBy: userId,
      status: "processed",
      description: "Processed 2",
    });

    const incomeForSplit = await ctx.db.insert("transactions", {
      organizationId,
      amount: 200,
      date: now + 1000,
      counterparty: "Test Spender",
      description: "Processed 3",
      importedBy: userId,
      status: "processed",
    });

    const expected1 = await ctx.db.insert("transactions", {
      organizationId,
      projectId: project,
      amount: -100,
      date: now,
      counterparty: "Test Empfänger",
      importedBy: userId,
      status: "expected",
      description: "Expected 1",
    });

    return {
      projectId: project,
      transactionIds: {
        processed1,
        processed2,
        incomeForSplit,
        expected1,
      },
    };
  },
});

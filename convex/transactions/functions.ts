import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { type MutationCtx, mutation } from "../_generated/server";
import { canAccessProject } from "../teams/permissions";
import { getCurrentUser } from "../users/getCurrentUser";
import { requireRole } from "../users/permissions";
import { validateDonorCategory } from "./validateDonorCategory";

async function ensureReservesDepartment(
  ctx: MutationCtx,
  organizationId: Id<"organizations">,
) {
  const existing = await ctx.db
    .query("projects")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .filter((q) =>
      q.and(
        q.eq(q.field("name"), "Reserves"),
        q.eq(q.field("parentId"), undefined),
      ),
    )
    .first();

  if (existing) return existing._id;

  const currentUser = await getCurrentUser(ctx);

  return await ctx.db.insert("projects", {
    name: "Reserves",
    parentId: undefined,
    organizationId,
    isArchived: false,
    createdBy: currentUser._id,
  });
}

export const createExpectedTransaction = mutation({
  args: {
    projectId: v.id("projects"),
    date: v.number(),
    amount: v.number(),
    description: v.string(),
    counterparty: v.string(),
    categoryId: v.id("categories"),
    status: v.literal("expected"),
    donorId: v.optional(v.id("donors")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "lead");
    const user = await getCurrentUser(ctx);

    if (!(await canAccessProject(ctx, user._id, args.projectId))) {
      throw new Error("No access to this project");
    }

    await validateDonorCategory(
      ctx,
      args.donorId,
      args.categoryId,
      user.organizationId,
    );

    return ctx.db.insert("transactions", {
      ...args,
      importedBy: user._id,
      organizationId: user.organizationId,
    });
  },
});

export const createImportedTransaction = mutation({
  args: {
    date: v.number(),
    importedTransactionId: v.string(),
    importSource: v.union(
      v.literal("sparkasse"),
      v.literal("volksbank"),
      v.literal("moss"),
    ),
    amount: v.number(),
    description: v.string(),
    counterparty: v.string(),
    accountName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "lead");
    const user = await getCurrentUser(ctx);

    const existing = await ctx.db
      .query("transactions")
      .withIndex("by_importedTransactionId", (q) =>
        q
          .eq("organizationId", user.organizationId)
          .eq("importedTransactionId", args.importedTransactionId),
      )
      .first();

    if (existing) return { skipped: true };

    await ctx.db.insert("transactions", {
      ...args,
      organizationId: user.organizationId,
      importedBy: user._id,
      status: "processed",
      projectId: undefined,
      categoryId: undefined,
      donorId: undefined,
    });

    return { inserted: true };
  },
});

export const updateTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    date: v.optional(v.number()),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    categoryId: v.optional(v.id("categories")),
    donorId: v.optional(v.id("donors")),
    matchedTransactionId: v.optional(v.string()),
    status: v.optional(v.union(v.literal("expected"), v.literal("processed"))),
  },
  handler: async (ctx, { transactionId, ...updates }) => {
    await requireRole(ctx, "lead");
    const user = await getCurrentUser(ctx);

    const transaction = await ctx.db.get(transactionId);
    if (!transaction) throw new Error("Transaction not found");
    if (transaction.organizationId !== user.organizationId)
      throw new Error("Access denied");

    if (
      transaction.projectId &&
      !(await canAccessProject(ctx, user._id, transaction.projectId))
    ) {
      throw new Error("No access to this project");
    }

    if (
      updates.projectId &&
      !(await canAccessProject(ctx, user._id, updates.projectId))
    ) {
      throw new Error("No access to the new project");
    }

    await validateDonorCategory(
      ctx,
      updates.donorId ?? transaction.donorId,
      updates.categoryId ?? transaction.categoryId,
      user.organizationId,
    );

    const validUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined),
    );

    return ctx.db.patch(transactionId, validUpdates);
  },
});

export const splitTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    splits: v.array(
      v.object({
        projectId: v.id("projects"),
        amount: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "lead");
    const user = await getCurrentUser(ctx);

    const original = await ctx.db.get(args.transactionId);
    if (!original) throw new Error("Transaction not found");
    if (original.organizationId !== user.organizationId)
      throw new Error("Access denied");
    if (original.status !== "processed")
      throw new Error("Can only split processed transactions");
    if (original.isArchived) throw new Error("Transaction is already split");
    if (args.splits.length === 0)
      throw new Error("Must provide at least one split");
    if (args.splits.some((s) => s.amount <= 0))
      throw new Error("All split amounts must be positive");

    const total = args.splits.reduce((sum, split) => sum + split.amount, 0);
    if (total > original.amount) {
      throw new Error(
        `Cannot split more than available. Available: ${original.amount}, Requested: ${total}`,
      );
    }

    for (const split of args.splits) {
      if (!(await canAccessProject(ctx, user._id, split.projectId))) {
        throw new Error(`No access to project ${split.projectId}`);
      }
    }

    const remainder = original.amount - total;
    const reservesId = await ensureReservesDepartment(
      ctx,
      original.organizationId,
    );

    await ctx.db.patch(args.transactionId, { isArchived: true });

    const createdIds: Id<"transactions">[] = [];

    for (const split of args.splits) {
      const newId = await ctx.db.insert("transactions", {
        organizationId: original.organizationId,
        date: original.date,
        description: `${original.description} (Split)`,
        counterparty: original.counterparty,
        status: "processed" as const,
        importedBy: original.importedBy,
        categoryId: original.categoryId,
        donorId: original.donorId,
        accountName: original.accountName,
        importedTransactionId: original.importedTransactionId,
        importSource: original.importSource,
        amount: split.amount,
        projectId: split.projectId,
        splitFromTransactionId: args.transactionId,
        isArchived: false,
      });
      createdIds.push(newId);
    }

    if (remainder > 0) {
      const reservesTransactionId = await ctx.db.insert("transactions", {
        organizationId: original.organizationId,
        date: original.date,
        description: `${original.description} (Remainder → Reserves)`,
        counterparty: original.counterparty,
        status: "processed" as const,
        importedBy: original.importedBy,
        categoryId: original.categoryId,
        donorId: original.donorId,
        accountName: original.accountName,
        importedTransactionId: original.importedTransactionId,
        importSource: original.importSource,
        amount: remainder,
        projectId: reservesId,
        splitFromTransactionId: args.transactionId,
        isArchived: false,
      });
      createdIds.push(reservesTransactionId);
    }

    return {
      originalId: args.transactionId,
      splitIds: createdIds,
      remainder,
      totalSplits: args.splits.length,
      hasRemainder: remainder > 0,
    };
  },
});

export const deleteExpectedTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "lead");
    const user = await getCurrentUser(ctx);

    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction || transaction.organizationId !== user.organizationId)
      throw new Error("Transaction not found or access denied");
    if (transaction.status !== "expected") {
      throw new Error("Can only delete expected transactions");
    }

    await ctx.db.delete(args.transactionId);
  },
});

export const transferMoney = mutation({
  args: {
    amount: v.number(),
    sendingProjectId: v.id("projects"),
    receivingProjectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "lead");
    const user = await getCurrentUser(ctx);

    const sendingProject = await ctx.db.get(args.sendingProjectId);
    const receivingProject = await ctx.db.get(args.receivingProjectId);

    const description = `Budgetübertrag von ${sendingProject?.name} zu ${receivingProject?.name}`;

    await ctx.db.insert("transactions", {
      date: Date.now(),
      importedBy: user._id,
      organizationId: user.organizationId,
      description,
      counterparty: "Internal Transfer",
      status: "processed",
      amount: -args.amount,
      projectId: args.sendingProjectId,
    });

    await ctx.db.insert("transactions", {
      date: Date.now(),
      importedBy: user._id,
      organizationId: user.organizationId,
      description,
      counterparty: "Internal Transfer",
      status: "processed",
      amount: args.amount,
      projectId: args.receivingProjectId,
    });
  },
});

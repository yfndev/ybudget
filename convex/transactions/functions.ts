import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { type MutationCtx, mutation } from "../_generated/server";
import { addLog } from "../logs/functions";
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

  const user = await getCurrentUser(ctx);
  return await ctx.db.insert("projects", {
    name: "Reserves",
    parentId: undefined,
    organizationId,
    isArchived: false,
    createdBy: user._id,
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
      throw new Error("Access denied");
    }

    await validateDonorCategory(
      ctx,
      args.donorId,
      args.categoryId,
      user.organizationId,
    );

    const transactionId = await ctx.db.insert("transactions", {
      ...args,
      importedBy: user._id,
      organizationId: user.organizationId,
    });

    await addLog(ctx, user.organizationId, user._id, "transaction.create", transactionId, `${args.description} (${args.amount}€)`);

    return transactionId;
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
    if (!transaction || transaction.organizationId !== user.organizationId) {
      throw new Error("Access denied");
    }

    if (
      transaction.projectId &&
      !(await canAccessProject(ctx, user._id, transaction.projectId))
    ) {
      throw new Error("Access denied");
    }

    if (
      updates.projectId &&
      !(await canAccessProject(ctx, user._id, updates.projectId))
    ) {
      throw new Error("Access denied");
    }

    await validateDonorCategory(
      ctx,
      updates.donorId ?? transaction.donorId,
      updates.categoryId ?? transaction.categoryId,
      user.organizationId,
    );

    await ctx.db.patch(transactionId, updates);
    await addLog(ctx, user.organizationId, user._id, "transaction.update", transactionId, transaction.description);
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
    if (
      !original ||
      original.organizationId !== user.organizationId ||
      original.status !== "processed" ||
      original.isArchived
    ) {
      throw new Error("Access denied");
    }

    const total = args.splits.reduce((sum, split) => sum + split.amount, 0);
    if (
      args.splits.length === 0 ||
      args.splits.some((s) => s.amount <= 0) ||
      total > original.amount
    ) {
      throw new Error("Invalid split amounts");
    }

    for (const split of args.splits) {
      if (!(await canAccessProject(ctx, user._id, split.projectId))) {
        throw new Error("Access denied");
      }
    }

    const remainder = original.amount - total;
    const reservesId = await ensureReservesDepartment(
      ctx,
      original.organizationId,
    );

    await ctx.db.patch(args.transactionId, { isArchived: true });

    const baseTransaction = {
      organizationId: original.organizationId,
      date: original.date,
      counterparty: original.counterparty,
      status: "processed" as const,
      importedBy: original.importedBy,
      categoryId: original.categoryId,
      donorId: original.donorId,
      accountName: original.accountName,
      importedTransactionId: original.importedTransactionId,
      importSource: original.importSource,
      splitFromTransactionId: args.transactionId,
      isArchived: false,
    };

    const createdIds: Id<"transactions">[] = [];

    for (const split of args.splits) {
      const newId = await ctx.db.insert("transactions", {
        ...baseTransaction,
        description: `${original.description} (Split)`,
        amount: split.amount,
        projectId: split.projectId,
      });
      createdIds.push(newId);
    }

    if (remainder > 0) {
      const reservesTransactionId = await ctx.db.insert("transactions", {
        ...baseTransaction,
        description: `${original.description} (Rest → Rücklagen)`,
        amount: remainder,
        projectId: reservesId,
      });
      createdIds.push(reservesTransactionId);
    }

    await addLog(ctx, user.organizationId, user._id, "transaction.split", args.transactionId, `${original.description} → ${args.splits.length} parts`);

    return createdIds;
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
    if (
      !transaction ||
      transaction.organizationId !== user.organizationId ||
      transaction.status !== "expected"
    ) {
      throw new Error("Access denied");
    }

    await ctx.db.delete(args.transactionId);
    await addLog(ctx, user.organizationId, user._id, "transaction.delete", args.transactionId, `${transaction.description} (${transaction.amount}€)`);
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

    const debitId = await ctx.db.insert("transactions", {
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

    await addLog(ctx, user.organizationId, user._id, "transaction.transfer", debitId, `${args.amount}€: ${sendingProject?.name} → ${receivingProject?.name}`);
  },
});

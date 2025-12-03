import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { addLog } from "../logs/functions";
import { getCurrentUser } from "../users/getCurrentUser";

export const createReimbursement = mutation({
  args: {
    amount: v.number(),
    projectId: v.id("projects"),
    iban: v.string(),
    bic: v.string(),
    accountHolder: v.string(),
    type: v.optional(v.union(v.literal("expense"), v.literal("travel"))),
    receipts: v.array(
      v.object({
        receiptNumber: v.string(),
        receiptDate: v.string(),
        companyName: v.string(),
        description: v.string(),
        netAmount: v.number(),
        taxRate: v.number(),
        grossAmount: v.number(),
        fileStorageId: v.id("_storage"),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.organizationId !== user.organizationId) {
      throw new Error("Invalid project");
    }

    const reimbursementId = await ctx.db.insert("reimbursements", {
      organizationId: user.organizationId,
      projectId: args.projectId,
      amount: args.amount,
      type: args.type || "expense",
      status: "pending",
      iban: args.iban,
      bic: args.bic,
      accountHolder: args.accountHolder,
      createdBy: user._id,
    });

    for (const receipt of args.receipts) {
      await ctx.db.insert("receipts", { reimbursementId, ...receipt });
    }

    await addLog(ctx, user.organizationId, user._id, "reimbursement.create", reimbursementId, `${args.amount}€`);

    return reimbursementId;
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await getCurrentUser(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

export const addReceipt = mutation({
  args: {
    reimbursementId: v.id("reimbursements"),
    receiptNumber: v.string(),
    receiptDate: v.string(),
    companyName: v.string(),
    description: v.string(),
    netAmount: v.number(),
    taxRate: v.number(),
    grossAmount: v.number(),
    fileStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const reimbursement = await ctx.db.get(args.reimbursementId);
    if (
      !reimbursement ||
      reimbursement.organizationId !== user.organizationId ||
      reimbursement.createdBy !== user._id
    ) {
      throw new Error("Unauthorized");
    }
    return ctx.db.insert("receipts", args);
  },
});

export const deleteReceipt = mutation({
  args: { receiptId: v.id("receipts") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const receipt = await ctx.db.get(args.receiptId);
    if (!receipt) throw new Error("Not found");

    const reimbursement = await ctx.db.get(receipt.reimbursementId);
    if (
      !reimbursement ||
      reimbursement.organizationId !== user.organizationId ||
      reimbursement.createdBy !== user._id
    ) {
      throw new Error("Unauthorized");
    }

    await ctx.storage.delete(receipt.fileStorageId);
    await ctx.db.delete(args.receiptId);
  },
});

export const updateReceipt = mutation({
  args: {
    receiptId: v.id("receipts"),
    receiptNumber: v.string(),
    receiptDate: v.string(),
    companyName: v.string(),
    description: v.string(),
    netAmount: v.number(),
    taxRate: v.number(),
    grossAmount: v.number(),
    fileStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const receipt = await ctx.db.get(args.receiptId);
    if (!receipt) throw new Error("Not found");

    const reimbursement = await ctx.db.get(receipt.reimbursementId);
    if (
      !reimbursement ||
      reimbursement.organizationId !== user.organizationId ||
      reimbursement.createdBy !== user._id
    ) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.receiptId, {
      receiptNumber: args.receiptNumber,
      receiptDate: args.receiptDate,
      companyName: args.companyName,
      description: args.description,
      netAmount: args.netAmount,
      taxRate: args.taxRate,
      grossAmount: args.grossAmount,
      fileStorageId: args.fileStorageId,
    });
  },
});

export const deleteReimbursement = mutation({
  args: { reimbursementId: v.id("reimbursements") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const reimbursement = await ctx.db.get(args.reimbursementId);
    if (
      !reimbursement ||
      reimbursement.organizationId !== user.organizationId ||
      reimbursement.createdBy !== user._id
    ) {
      throw new Error("Unauthorized");
    }

    const receipts = await ctx.db
      .query("receipts")
      .withIndex("by_reimbursement", (q) =>
        q.eq("reimbursementId", args.reimbursementId),
      )
      .collect();
    for (const receipt of receipts) {
      await ctx.storage.delete(receipt.fileStorageId);
      await ctx.db.delete(receipt._id);
    }
    await ctx.db.delete(args.reimbursementId);
  },
});

export const markAsPaid = mutation({
  args: { reimbursementId: v.id("reimbursements") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin") throw new Error("Admin required");
    const reimbursement = await ctx.db.get(args.reimbursementId);
    if (
      !reimbursement ||
      reimbursement.organizationId !== user.organizationId
    ) {
      throw new Error("Unauthorized");
    }

    const category = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("name"), "Auslagenerstattung"))
      .first();

    await ctx.db.insert("transactions", {
      organizationId: reimbursement.organizationId,
      projectId: reimbursement.projectId,
      date: Date.now(),
      amount: -reimbursement.amount,
      description: "Auslagenerstattung",
      counterparty: reimbursement.accountHolder,
      categoryId: category?._id,
      status: "expected",
      importedBy: user._id,
    });

    await ctx.db.patch(args.reimbursementId, { status: "paid" });

    await addLog(ctx, user.organizationId, user._id, "reimbursement.pay", args.reimbursementId, `${reimbursement.amount}€ → ${reimbursement.accountHolder}`);
  },
});

export const rejectReimbursement = mutation({
  args: {
    reimbursementId: v.id("reimbursements"),
    adminNote: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin") throw new Error("Admin required");
    const reimbursement = await ctx.db.get(args.reimbursementId);
    if (
      !reimbursement ||
      reimbursement.organizationId !== user.organizationId
    ) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.reimbursementId, {
      status: "rejected",
      adminNote: args.adminNote,
    });

    await addLog(ctx, user.organizationId, user._id, "reimbursement.reject", args.reimbursementId, `${reimbursement.amount}€ - ${args.adminNote}`);
  },
});

export const updateReimbursement = mutation({
  args: {
    reimbursementId: v.id("reimbursements"),
    projectId: v.id("projects"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const reimbursement = await ctx.db.get(args.reimbursementId);
    if (
      !reimbursement ||
      reimbursement.organizationId !== user.organizationId
    ) {
      throw new Error("Not found");
    }
    if (reimbursement.createdBy !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.reimbursementId, {
      projectId: args.projectId,
      amount: args.amount,
      status: "pending",
    });
  },
});

export const deleteReimbursementAdmin = mutation({
  args: { reimbursementId: v.id("reimbursements") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin") throw new Error("Admin required");
    const reimbursement = await ctx.db.get(args.reimbursementId);
    if (
      !reimbursement ||
      reimbursement.organizationId !== user.organizationId
    ) {
      throw new Error("Unauthorized");
    }

    const receipts = await ctx.db
      .query("receipts")
      .withIndex("by_reimbursement", (q) =>
        q.eq("reimbursementId", args.reimbursementId),
      )
      .collect();
    for (const receipt of receipts) {
      await ctx.storage.delete(receipt.fileStorageId);
      await ctx.db.delete(receipt._id);
    }
    await ctx.db.delete(args.reimbursementId);

    await addLog(ctx, user.organizationId, user._id, "reimbursement.delete", args.reimbursementId, `${reimbursement.amount}€`);
  },
});

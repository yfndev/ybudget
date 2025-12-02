
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";
import { requireRole } from "../users/permissions";

export const createReimbursement = mutation({
  args: {
    amount: v.number(),
    projectId: v.id("projects"),
    iban: v.string(),
    bic: v.string(),
    accountHolder: v.string(),
    receipts: v.array(v.object({
      receiptNumber: v.string(),
      receiptDate: v.string(),
      companyName: v.string(),
      description: v.string(),
      netAmount: v.number(),
      taxRate: v.number(),
      grossAmount: v.number(),
      fileStorageId: v.id("_storage"),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const reimbursementId = await ctx.db.insert("reimbursements", {
      organizationId: user.organizationId,
      projectId: args.projectId,
      amount: args.amount,
      status: "pending",
      iban: args.iban,
      bic: args.bic,
      accountHolder: args.accountHolder,
      createdBy: user._id,
    });

    for (const receipt of args.receipts) {
      await ctx.db.insert("receipts", {
        reimbursementId,
        ...receipt,
      });
    }

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
    await getCurrentUser(ctx);
    return ctx.db.insert("receipts", args);
  },
});

export const deleteReceipt = mutation({
  args: { receiptId: v.id("receipts") },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);
    const receipt = await ctx.db.get(args.receiptId);
    if (!receipt) return;

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
    await getCurrentUser(ctx);
    const { receiptId, ...data } = args;
    await ctx.db.patch(receiptId, data);
  },
});

async function deleteAllReceipts(ctx: any, reimbursementId: any) {
  const receipts = await ctx.db
    .query("receipts")
    .withIndex("by_reimbursement", (q: any) => q.eq("reimbursementId", reimbursementId))
    .collect();

  for (const receipt of receipts) {
    await ctx.storage.delete(receipt.fileStorageId);
    await ctx.db.delete(receipt._id);
  }
}

export const deleteReimbursement = mutation({
  args: { reimbursementId: v.id("reimbursements") },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);
    await deleteAllReceipts(ctx, args.reimbursementId);
    await ctx.db.delete(args.reimbursementId);
  },
});

export const markAsPaid = mutation({
  args: { reimbursementId: v.id("reimbursements") },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");
    await ctx.db.patch(args.reimbursementId, { status: "paid" });
  },
});

export const rejectReimbursement = mutation({
  args: {
    reimbursementId: v.id("reimbursements"),
    adminNote: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");
    await ctx.db.patch(args.reimbursementId, {
      status: "rejected",
      adminNote: args.adminNote,
    });
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

    if (!reimbursement) throw new Error("Reimbursement not found");
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
    await requireRole(ctx, "admin");
    await deleteAllReceipts(ctx, args.reimbursementId);
    await ctx.db.delete(args.reimbursementId);
  },
});


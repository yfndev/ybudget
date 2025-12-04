import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { addLog } from "../logs/functions";
import { getCurrentUser } from "../users/getCurrentUser";

const travelDetailsValidator = v.object({
  travelStartDate: v.string(),
  travelEndDate: v.string(),
  destination: v.string(),
  travelPurpose: v.string(),
  isInternational: v.boolean(),
  transportationMode: v.union(
    v.literal("car"),
    v.literal("train"),
    v.literal("flight"),
    v.literal("taxi"),
    v.literal("bus"),
  ),
  kilometers: v.optional(v.number()),
  transportationAmount: v.number(),
  accommodationAmount: v.number(),
  transportationReceiptId: v.optional(v.id("_storage")),
  accommodationReceiptId: v.optional(v.id("_storage")),
});

export const createReimbursement = mutation({
  args: {
    amount: v.number(),
    projectId: v.id("projects"),
    iban: v.string(),
    bic: v.string(),
    accountHolder: v.string(),
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

    const reimbursementId = await ctx.db.insert("reimbursements", {
      organizationId: user.organizationId,
      projectId: args.projectId,
      amount: args.amount,
      type: "expense",
      status: "pending",
      iban: args.iban,
      bic: args.bic,
      accountHolder: args.accountHolder,
      createdBy: user._id,
    });

    for (const receipt of args.receipts) {
      await ctx.db.insert("receipts", { reimbursementId, ...receipt });
    }

    await addLog(
      ctx,
      user.organizationId,
      user._id,
      "reimbursement.create",
      reimbursementId,
      `${args.amount}€`,
    );
    return reimbursementId;
  },
});

export const createTravelReimbursement = mutation({
  args: {
    amount: v.number(),
    projectId: v.id("projects"),
    iban: v.string(),
    bic: v.string(),
    accountHolder: v.string(),
    travelDetails: travelDetailsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const reimbursementId = await ctx.db.insert("reimbursements", {
      organizationId: user.organizationId,
      projectId: args.projectId,
      amount: args.amount,
      type: "travel",
      status: "pending",
      iban: args.iban,
      bic: args.bic,
      accountHolder: args.accountHolder,
      createdBy: user._id,
    });

    await ctx.db.insert("travelDetails", {
      reimbursementId,
      ...args.travelDetails,
    });
    await addLog(
      ctx,
      user.organizationId,
      user._id,
      "reimbursement.create",
      reimbursementId,
      `Travel ${args.amount}€`,
    );
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

export const deleteReimbursement = mutation({
  args: { reimbursementId: v.id("reimbursements") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const reimbursement = await ctx.db.get(args.reimbursementId);
    if (!reimbursement) return;

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

    if (reimbursement.type === "travel") {
      const travel = await ctx.db
        .query("travelDetails")
        .withIndex("by_reimbursement", (q) =>
          q.eq("reimbursementId", args.reimbursementId),
        )
        .first();
      if (travel) {
        if (travel.transportationReceiptId)
          await ctx.storage.delete(travel.transportationReceiptId);
        if (travel.accommodationReceiptId)
          await ctx.storage.delete(travel.accommodationReceiptId);
        await ctx.db.delete(travel._id);
      }
    }

    await ctx.db.delete(args.reimbursementId);
    await addLog(
      ctx,
      user.organizationId,
      user._id,
      "reimbursement.delete",
      args.reimbursementId,
      `${reimbursement.amount}€`,
    );
  },
});

export const markAsPaid = mutation({
  args: { reimbursementId: v.id("reimbursements") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const reimbursement = await ctx.db.get(args.reimbursementId);
    if (!reimbursement) return;

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
    await addLog(
      ctx,
      user.organizationId,
      user._id,
      "reimbursement.pay",
      args.reimbursementId,
      `${reimbursement.amount}€`,
    );
  },
});

export const rejectReimbursement = mutation({
  args: {
    reimbursementId: v.id("reimbursements"),
    adminNote: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const reimbursement = await ctx.db.get(args.reimbursementId);

    await ctx.db.patch(args.reimbursementId, {
      status: "rejected",
      adminNote: args.adminNote,
    });

    if (reimbursement) {
      await addLog(
        ctx,
        user.organizationId,
        user._id,
        "reimbursement.reject",
        args.reimbursementId,
        `${reimbursement.amount}€`,
      );
    }
  },
});

export const updateReimbursement = mutation({
  args: {
    reimbursementId: v.id("reimbursements"),
    projectId: v.id("projects"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reimbursementId, {
      projectId: args.projectId,
      amount: args.amount,
      status: "pending",
    });
  },
});

export const updateTravelReimbursement = mutation({
  args: {
    reimbursementId: v.id("reimbursements"),
    projectId: v.id("projects"),
    amount: v.number(),
    travelDetails: travelDetailsValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reimbursementId, {
      projectId: args.projectId,
      amount: args.amount,
      status: "pending",
    });

    const existing = await ctx.db
      .query("travelDetails")
      .withIndex("by_reimbursement", (q) =>
        q.eq("reimbursementId", args.reimbursementId),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args.travelDetails);
    } else {
      await ctx.db.insert("travelDetails", {
        reimbursementId: args.reimbursementId,
        ...args.travelDetails,
      });
    }
  },
});

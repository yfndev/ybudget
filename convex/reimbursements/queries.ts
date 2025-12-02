import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getUserBankDetails = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return {
      iban: user.iban || "",
      bic: user.bic || "",
      accountHolder: user.accountHolder || user.name || "",
    };
  },
});

export const getReimbursement = query({
  args: { reimbursementId: v.id("reimbursements") },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);
    return await ctx.db.get(args.reimbursementId);
  },
});

export const getReceipts = query({
  args: { reimbursementId: v.id("reimbursements") },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);
    return await ctx.db
      .query("receipts")
      .withIndex("by_reimbursement", (q) => q.eq("reimbursementId", args.reimbursementId))
      .collect();
  },
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});

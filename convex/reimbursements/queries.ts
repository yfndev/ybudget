import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getUserBankDetails = query({
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
    const reimbursement = await ctx.db.get(args.reimbursementId);
    if (!reimbursement) return null;

    if (reimbursement.type === "travel") {
      const travelDetails = await ctx.db
        .query("travelDetails")
        .withIndex("by_reimbursement", (q) =>
          q.eq("reimbursementId", args.reimbursementId),
        )
        .first();
      return { ...reimbursement, travelDetails };
    }

    return reimbursement;
  },
});

export const getReceipts = query({
  args: { reimbursementId: v.id("reimbursements") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("receipts")
      .withIndex("by_reimbursement", (q) =>
        q.eq("reimbursementId", args.reimbursementId),
      )
      .collect();
  },
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return ctx.storage.getUrl(args.storageId);
  },
});

export const getAllReimbursements = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const isAdmin = user.role === "admin";

    const reimbursements = isAdmin
      ? await ctx.db
          .query("reimbursements")
          .withIndex("by_organization", (q) =>
            q.eq("organizationId", user.organizationId),
          )
          .order("desc")
          .collect()
      : await ctx.db
          .query("reimbursements")
          .withIndex("by_organization_and_createdBy", (q) =>
            q
              .eq("organizationId", user.organizationId)
              .eq("createdBy", user._id),
          )
          .order("desc")
          .collect();

    const creatorIds = [...new Set(reimbursements.map((r) => r.createdBy))];
    const projectIds = [...new Set(reimbursements.map((r) => r.projectId))];
    const travelReimbursementIds = reimbursements
      .filter((r) => r.type === "travel")
      .map((r) => r._id);

    const [creators, projects, travelDetailsList] = await Promise.all([
      Promise.all(creatorIds.map((id) => ctx.db.get(id))),
      Promise.all(projectIds.map((id) => ctx.db.get(id))),
      Promise.all(
        travelReimbursementIds.map((id) =>
          ctx.db
            .query("travelDetails")
            .withIndex("by_reimbursement", (q) => q.eq("reimbursementId", id))
            .first(),
        ),
      ),
    ]);

    const creatorMap = new Map(
      creators.filter(Boolean).map((c) => [c!._id, c!.name]),
    );
    const projectMap = new Map(
      projects.filter(Boolean).map((p) => [p!._id, p!.name]),
    );
    const travelMap = new Map(
      travelDetailsList.filter(Boolean).map((t) => [t!.reimbursementId, t!]),
    );

    return reimbursements.map((r) => ({
      ...r,
      creatorName: creatorMap.get(r.createdBy) || "Unknown",
      projectName: projectMap.get(r.projectId) || "Unbekanntes Projekt",
      travelDetails: travelMap.get(r._id),
    }));
  },
});

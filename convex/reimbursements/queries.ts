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

    const creatorIds = [
      ...new Set(reimbursements.map((reimbursement) => reimbursement.createdBy)),
    ];
    const projectIds = [
      ...new Set(reimbursements.map((reimbursement) => reimbursement.projectId)),
    ];
    const travelReimbursementIds = reimbursements
      .filter((reimbursement) => reimbursement.type === "travel")
      .map((reimbursement) => reimbursement._id);

    const [creators, projects, travelDetailsList] = await Promise.all([
      Promise.all(creatorIds.map((creatorId) => ctx.db.get(creatorId))),
      Promise.all(projectIds.map((projectId) => ctx.db.get(projectId))),
      Promise.all(
        travelReimbursementIds.map((reimbursementId) =>
          ctx.db
            .query("travelDetails")
            .withIndex("by_reimbursement", (q) =>
              q.eq("reimbursementId", reimbursementId),
            )
            .first(),
        ),
      ),
    ]);

    const creatorMap = new Map(
      creators.filter(Boolean).map((creator) => [creator!._id, creator!.name]),
    );
    const projectMap = new Map(
      projects.filter(Boolean).map((project) => [project!._id, project!.name]),
    );
    const travelMap = new Map(
      travelDetailsList
        .filter(Boolean)
        .map((detail) => [detail!.reimbursementId, detail!]),
    );

    return reimbursements.map((reimbursement) => ({
      ...reimbursement,
      creatorName: creatorMap.get(reimbursement.createdBy) || "Unknown",
      projectName: projectMap.get(reimbursement.projectId) || "Unbekanntes Projekt",
      travelDetails: travelMap.get(reimbursement._id),
    }));
  },
});

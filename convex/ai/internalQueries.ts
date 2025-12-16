import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
import { filterByProjectAccess } from "../teams/permissions";
import { addProjectAndCategoryNames } from "../utils/addProjectAndCategoryNames";

export const getTransactions = internalQuery({
  args: {
    userId: v.id("users"),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.neq(q.field("isArchived"), true))
      .collect();

    const filtered = await filterByProjectAccess(ctx, args.userId, args.organizationId, transactions);
    return addProjectAndCategoryNames(ctx, filtered);
  },
});

export const getReimbursements = internalQuery({
  args: {
    userId: v.id("users"),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    const isAdmin = user?.role === "admin";

    const reimbursements = isAdmin
      ? await ctx.db
          .query("reimbursements")
          .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
          .collect()
      : await ctx.db
          .query("reimbursements")
          .withIndex("by_organization_and_createdBy", (q) =>
            q.eq("organizationId", args.organizationId).eq("createdBy", args.userId),
          )
          .collect();

    const volunteerAllowances = isAdmin
      ? await ctx.db
          .query("volunteerAllowance")
          .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
          .collect()
      : await ctx.db
          .query("volunteerAllowance")
          .withIndex("by_organization_and_createdBy", (q) =>
            q.eq("organizationId", args.organizationId).eq("createdBy", args.userId),
          )
          .collect();

    const reimbursementResults = await Promise.all(
      reimbursements.map(async (reimbursement) => {
        const [creator, project] = await Promise.all([
          ctx.db.get(reimbursement.createdBy),
          ctx.db.get(reimbursement.projectId),
        ]);
        return {
          ...reimbursement,
          category: reimbursement.type === "expense" ? "Ausgabe" : "Reise",
          creatorName: creator?.name || "Unbekannt",
          projectName: project?.name || "Unbekanntes Projekt",
        };
      }),
    );

    const volunteerResults = await Promise.all(
      volunteerAllowances.map(async (allowance) => {
        const [creator, project] = await Promise.all([
          ctx.db.get(allowance.createdBy),
          ctx.db.get(allowance.projectId),
        ]);
        return {
          ...allowance,
          category: "Ehrenamtspauschale" as const,
          creatorName: creator?.name || "Unbekannt",
          projectName: project?.name || "Unbekanntes Projekt",
        };
      }),
    );

    return [...reimbursementResults, ...volunteerResults];
  },
});

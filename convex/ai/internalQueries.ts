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
    const allTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .collect();

    const transactions = allTransactions.filter((t) => !t.isArchived);
    const filtered = await filterByProjectAccess(
      ctx,
      args.userId,
      args.organizationId,
      transactions,
    );
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

    const [reimbursements, volunteerAllowances] = await Promise.all([
      isAdmin
        ? ctx.db
            .query("reimbursements")
            .withIndex("by_organization", (q) =>
              q.eq("organizationId", args.organizationId),
            )
            .collect()
        : ctx.db
            .query("reimbursements")
            .withIndex("by_organization_and_createdBy", (q) =>
              q
                .eq("organizationId", args.organizationId)
                .eq("createdBy", args.userId),
            )
            .collect(),
      isAdmin
        ? ctx.db
            .query("volunteerAllowance")
            .withIndex("by_organization", (q) =>
              q.eq("organizationId", args.organizationId),
            )
            .collect()
        : ctx.db
            .query("volunteerAllowance")
            .withIndex("by_organization_and_createdBy", (q) =>
              q
                .eq("organizationId", args.organizationId)
                .eq("createdBy", args.userId),
            )
            .collect(),
    ]);

    const allItems = [...reimbursements, ...volunteerAllowances];
    const creatorIds = [...new Set(allItems.map((i) => i.createdBy))];
    const projectIds = [...new Set(allItems.map((i) => i.projectId))];

    const [creators, projects] = await Promise.all([
      Promise.all(creatorIds.map((id) => ctx.db.get(id))),
      Promise.all(projectIds.map((id) => ctx.db.get(id))),
    ]);

    const creatorMap = new Map(
      creators.filter(Boolean).map((c) => [c!._id, c!.name]),
    );
    const projectMap = new Map(
      projects.filter(Boolean).map((p) => [p!._id, p!.name]),
    );

    const reimbursementResults = reimbursements.map((r) => ({
      ...r,
      category: r.type === "expense" ? "Ausgabe" : "Reise",
      creatorName: creatorMap.get(r.createdBy) || "Unbekannt",
      projectName: projectMap.get(r.projectId) || "Unbekanntes Projekt",
    }));

    const volunteerResults = volunteerAllowances.map((a) => ({
      ...a,
      category: "Ehrenamtspauschale" as const,
      creatorName: creatorMap.get(a.createdBy) || "Unbekannt",
      projectName: projectMap.get(a.projectId) || "Unbekanntes Projekt",
    }));

    return [...reimbursementResults, ...volunteerResults];
  },
});

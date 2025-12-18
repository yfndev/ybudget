import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { getUserAccessibleProjectIds } from "../teams/permissions";
import { getCurrentUser } from "../users/getCurrentUser";

export const getAllProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) return [];

    const organizationId = user.organizationId;
    const accessibleIds = await getUserAccessibleProjectIds(
      ctx,
      user._id,
      organizationId,
    );

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId),
      )
      .collect();

    return projects.filter(
      (project) => !project.isArchived && accessibleIds.includes(project._id),
    );
  },
});

export const getProjectById = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await getCurrentUser(ctx);
    const accessibleIds = await getUserAccessibleProjectIds(
      ctx,
      user._id,
      user.organizationId,
    );

    if (!accessibleIds.includes(args.projectId)) throw new Error("No access");

    return ctx.db.get(args.projectId);
  },
});

export const getDepartments = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization_parentId", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .collect();
    return projects.filter((project) => !project.parentId);
  },
});

export const getBookableProjects = query({
  args: { isExpense: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) return [];

    const organizationId = user.organizationId;
    const accessibleIds = await getUserAccessibleProjectIds(
      ctx,
      user._id,
      organizationId,
    );

    const allProjects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId),
      )
      .collect();

    const active = allProjects.filter(
      (project) => !project.isArchived && accessibleIds.includes(project._id),
    );

    const parentIds = new Set(
      active.map((project) => project.parentId).filter(Boolean),
    );

    return active.filter((project) => {
      if (!project.parentId && parentIds.has(project._id)) return false;
      if (args.isExpense && project.name === "Rücklagen" && !project.parentId)
        return false;
      return true;
    });
  },
});

export const getChildProjectIds = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const allProjects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .collect();

    const active = allProjects.filter((project) => !project.isArchived);
    const result: (typeof args.projectId)[] = [];

    const collectChildren = (parentId: typeof args.projectId) => {
      for (const project of active) {
        if (project.parentId === parentId) {
          result.push(project._id);
          collectChildren(project._id);
        }
      }
    };

    collectChildren(args.projectId);
    return result;
  },
});

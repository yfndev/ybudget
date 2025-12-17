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
      .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
      .collect();

    return projects.filter(
      (p) => !p.isArchived && accessibleIds.includes(p._id),
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
    return projects.filter((p) => !p.parentId);
  },
});

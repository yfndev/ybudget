import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { getUserAccessibleProjectIds } from "../teams/permissions";
import { getCurrentUser } from "../users/getCurrentUser";

export const getAllProjects = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getCurrentUser(ctx);
    const accessibleIds = await getUserAccessibleProjectIds(
      ctx,
      user._id,
      user.organizationId,
    );

    const allProjects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .filter((q) => q.neq(q.field("isArchived"), true))
      .collect();

    return allProjects.filter((p) => accessibleIds.includes(p._id));
  },
});

export const getAllOrganizationProjects = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getCurrentUser(ctx);

    return await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .collect();
  },
});

export const getChildProjects = query({
  args: { parentId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const accessibleIds = await getUserAccessibleProjectIds(
      ctx,
      user._id,
      user.organizationId,
    );

    const allProjects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .filter((q) => q.eq(q.field("parentId"), args.parentId as Id<"projects">))
      .collect();

    return allProjects.filter((p) => accessibleIds.includes(p._id));
  },
});

export const getProjectById = query({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await getCurrentUser(ctx);
    const accessibleIds = await getUserAccessibleProjectIds(
      ctx,
      user._id,
      user.organizationId,
    );

    const projectId = args.projectId as Id<"projects">;
    if (!accessibleIds.includes(projectId)) {
      throw new Error("No access to this project");
    }

    return await ctx.db.get(projectId);
  },
});

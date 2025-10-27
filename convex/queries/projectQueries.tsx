import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { getAuthenticatedUser } from "../utils/auth";

export const getProjects = query({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId)
      )
      .collect();
    return projects;
  },
});

export const getProjectById = query({
  args: { projectId: v.string() },

  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return null;

    const project = await ctx.db.get(args.projectId as Id<"projects">);
    return project;
  },
});

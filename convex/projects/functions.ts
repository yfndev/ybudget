import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { addLog } from "../logs/functions";
import { getCurrentUser } from "../users/getCurrentUser";
import { requireRole } from "../users/permissions";

const FREE_TIER_LIMIT = 10;

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "lead");
    const user = await getCurrentUser(ctx);

    const activePayment = await ctx.db
      .query("payments")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .first();

    const isPremium = activePayment !== null;

    if (!isPremium) {
      const existingProjects = await ctx.db
        .query("projects")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId),
        )
        .collect();

      if (existingProjects.length >= FREE_TIER_LIMIT) {
        throw new Error(
          `Du hast das Limit von ${FREE_TIER_LIMIT} Projekten erreicht. Bitte upgrade auf Premium.`,
        );
      }
    }

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      organizationId: user.organizationId,
      parentId: args.parentId,
      isArchived: false,
      createdBy: user._id,
    });

    await addLog(ctx, user.organizationId, user._id, "project.create", projectId, args.name);

    return projectId;
  },
});

export const renameProject = mutation({
  args: { projectId: v.id("projects"), name: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, "lead");
    const user = await getCurrentUser(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.organizationId !== user.organizationId) {
      throw new Error(!project ? "Project not found" : "Access denied");
    }

    await ctx.db.patch(args.projectId, { name: args.name });
    await addLog(ctx, user.organizationId, user._id, "project.rename", args.projectId, `${project.name} → ${args.name}`);
  },
});

export const archiveProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");
    const user = await getCurrentUser(ctx);
    const project = await ctx.db.get(args.projectId);

    await ctx.db.patch(args.projectId, { isArchived: true });
    await addLog(ctx, user.organizationId, user._id, "project.archive", args.projectId, project?.name);
  },
});

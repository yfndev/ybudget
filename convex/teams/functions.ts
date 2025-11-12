import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";
import { requireRole } from "../users/permissions";
import { isTeamAdmin } from "./permissions";

const teamRoleValidator = v.union(
  v.literal("viewer"),
  v.literal("editor"),
  v.literal("admin"),
);

async function requireTeamAdmin(ctx: any, userId: any, teamId: any) {
  if (!(await isTeamAdmin(ctx, userId, teamId))) {
    throw new Error("Only team admins can perform this action");
  }
}

export const createTeam = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");
    const user = await getCurrentUser(ctx);

    return await ctx.db.insert("teams", {
      name: args.name,
      organizationId: user.organizationId,
      createdAt: Date.now(),
      createdBy: user._id,
    });
  },
});

export const renameTeam = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
  },

  handler: async (ctx, args) => {
    if (!args.name.trim()) {
      throw new Error("Team name cannot be empty");
    }

    const user = await getCurrentUser(ctx);
    const team = await ctx.db.get(args.teamId);

    if (!team) {
      throw new Error("Team not found");
    }

    const isOrgAdmin = user.role === "admin";
    const isTeamAdminUser = await isTeamAdmin(ctx, user._id, args.teamId);

    if (!isOrgAdmin && !isTeamAdminUser) {
      throw new Error("Only admins and team admins can rename teams");
    }

    await ctx.db.patch(args.teamId, {
      name: args.name,
    });
  },
});

export const addTeamMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: teamRoleValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    await requireTeamAdmin(ctx, user._id, args.teamId);

    const existing = await ctx.db
      .query("teamMemberships")
      .withIndex("by_user_team", (q) =>
        q.eq("userId", args.userId).eq("teamId", args.teamId),
      )
      .first();

    if (existing) throw new Error("User is already a team member");

    await ctx.db.insert("teamMemberships", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const removeTeamMember = mutation({
  args: {
    membershipId: v.id("teamMemberships"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const membership = await ctx.db.get(args.membershipId);

    if (!membership) throw new Error("Membership not found");

    await requireTeamAdmin(ctx, user._id, membership.teamId);
    await ctx.db.delete(args.membershipId);
  },
});

export const updateTeamMemberRole = mutation({
  args: {
    membershipId: v.id("teamMemberships"),
    role: teamRoleValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const membership = await ctx.db.get(args.membershipId);

    if (!membership) throw new Error("Membership not found");

    await requireTeamAdmin(ctx, user._id, membership.teamId);
    await ctx.db.patch(args.membershipId, { role: args.role });
  },
});

export const assignProjectToTeam = mutation({
  args: {
    teamId: v.id("teams"),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");

    const existing = await ctx.db
      .query("teamProjects")
      .withIndex("by_team_project", (q) =>
        q.eq("teamId", args.teamId).eq("projectId", args.projectId),
      )
      .first();

    if (existing) throw new Error("Project already assigned to team");

    await ctx.db.insert("teamProjects", {
      teamId: args.teamId,
      projectId: args.projectId,
      createdAt: Date.now(),
    });
  },
});

export const removeProjectFromTeam = mutation({
  args: {
    teamProjectId: v.id("teamProjects"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");
    await ctx.db.delete(args.teamProjectId);
  },
});

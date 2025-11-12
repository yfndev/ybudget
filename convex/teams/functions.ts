import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
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
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");
    const user = await getCurrentUser(ctx);

    return await ctx.db.insert("teams", {
      name: args.name,
      description: args.description,
      organizationId: user.organizationId,
      createdAt: Date.now(),
      createdBy: user._id,
    });
  },
});

export const getAllTeams = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    return await ctx.db
      .query("teams")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .collect();
  },
});

export const getTeamMembers = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    return await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return {
          membershipId: m._id,
          userId: m.userId,
          role: m.role,
          name: user?.name,
          email: user?.email,
          image: user?.image,
        };
      }),
    );
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

export const getProjectTeams = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const teamProjects = await ctx.db
      .query("teamProjects")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const teams = await Promise.all(
      teamProjects.map((tp) => ctx.db.get(tp.teamId)),
    );

    return teamProjects
      .map((tp, i) => (teams[i] ? { ...teams[i], assignmentId: tp._id } : null))
      .filter(Boolean);
  },
});

export const getTeamProjects = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const teamProjects = await ctx.db
      .query("teamProjects")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const projects = await Promise.all(
      teamProjects.map((tp) => ctx.db.get(tp.projectId)),
    );

    return teamProjects
      .map((tp, i) => (projects[i] ? { ...projects[i], assignmentId: tp._id } : null))
      .filter(Boolean);
  },
});

export const getUserTeamMemberships = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("teamMemberships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return await Promise.all(
      memberships.map(async (m) => {
        const team = await ctx.db.get(m.teamId);
        const teamProjects = await ctx.db
          .query("teamProjects")
          .withIndex("by_team", (q) => q.eq("teamId", m.teamId))
          .collect();

        return {
          _id: m._id,
          teamId: m.teamId,
          teamName: team?.name || "Unknown Team",
          role: m.role,
          projectCount: teamProjects.length,
        };
      }),
    );
  },
});

export const getUserAccessibleProjects = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user?.organizationId) return [];

    const memberships = await ctx.db
      .query("teamMemberships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const projectMap = new Map<string, { project: any; teams: { name: string; role: string }[] }>();

    for (const membership of memberships) {
      const team = await ctx.db.get(membership.teamId);
      const teamProjects = await ctx.db
        .query("teamProjects")
        .withIndex("by_team", (q) => q.eq("teamId", membership.teamId))
        .collect();

      for (const tp of teamProjects) {
        const project = await ctx.db.get(tp.projectId);
        if (!project) continue;

        const key = project._id;
        if (!projectMap.has(key)) {
          projectMap.set(key, { project, teams: [] });
        }
        projectMap.get(key)!.teams.push({
          name: team?.name || "Unknown",
          role: membership.role,
        });
      }
    }

    return Array.from(projectMap.values()).map(({ project, teams }) => ({
      _id: project._id,
      name: project.name,
      description: project.description,
      teams: teams,
      highestRole: teams.reduce((highest, t) => {
        const hierarchy = { viewer: 1, editor: 2, admin: 3 };
        const currentLevel = hierarchy[t.role as keyof typeof hierarchy] || 0;
        const highestLevel = hierarchy[highest as keyof typeof hierarchy] || 0;
        return currentLevel > highestLevel ? t.role : highest;
      }, "viewer"),
    }));
  },
});


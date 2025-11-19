import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getAllTeams = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return ctx.db
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
    const user = await getCurrentUser(ctx);
    const team = await ctx.db.get(args.teamId);
    if (team?.organizationId !== user.organizationId)
      throw new Error("Access denied");

    const memberships = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    return Promise.all(
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

export const getProjectTeams = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const project = await ctx.db.get(args.projectId);
    if (project?.organizationId !== user.organizationId)
      throw new Error("Access denied");

    const teamProjects = await ctx.db
      .query("teamProjects")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const teams = await Promise.all(
      teamProjects.map((tp) => ctx.db.get(tp.teamId)),
    );
    return teamProjects
      .map((tp, i) => teams[i] && { ...teams[i], assignmentId: tp._id })
      .filter(Boolean);
  },
});

export const getTeamProjects = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const team = await ctx.db.get(args.teamId);
    if (team?.organizationId !== user.organizationId)
      throw new Error("Access denied");

    const teamProjects = await ctx.db
      .query("teamProjects")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const projects = await Promise.all(
      teamProjects.map((tp) => ctx.db.get(tp.projectId)),
    );
    return teamProjects
      .map((tp, i) => projects[i] && { ...projects[i], assignmentId: tp._id })
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

    return Promise.all(
      memberships.map(async (m) => {
        const [team, teamProjects] = await Promise.all([
          ctx.db.get(m.teamId),
          ctx.db
            .query("teamProjects")
            .withIndex("by_team", (q) => q.eq("teamId", m.teamId))
            .collect(),
        ]);

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
    const currentUser = await getCurrentUser(ctx);
    const user = await ctx.db.get(args.userId);
    if (
      !user?.organizationId ||
      user.organizationId !== currentUser.organizationId
    )
      return [];

    const memberships = await ctx.db
      .query("teamMemberships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const projectMap = new Map();

    for (const m of memberships) {
      const [team, teamProjects] = await Promise.all([
        ctx.db.get(m.teamId),
        ctx.db
          .query("teamProjects")
          .withIndex("by_team", (q) => q.eq("teamId", m.teamId))
          .collect(),
      ]);

      for (const tp of teamProjects) {
        const project = await ctx.db.get(tp.projectId);
        if (!project) continue;

        if (!projectMap.has(project._id)) {
          projectMap.set(project._id, { project, teams: [] });
        }
        projectMap
          .get(project._id)
          .teams.push({ name: team?.name || "Unknown", role: m.role });
      }
    }

    const hierarchy = { viewer: 1, editor: 2, admin: 3 };

    return Array.from(projectMap.values()).map(({ project, teams }) => {
      const highestRole = teams.reduce(
        (best: string, member: { name: string; role: string }) =>
          hierarchy[member.role as keyof typeof hierarchy] >
          hierarchy[best as keyof typeof hierarchy]
            ? member.role
            : best,
        "viewer",
      );
      return { ...project, teams, highestRole };
    });
  },
});

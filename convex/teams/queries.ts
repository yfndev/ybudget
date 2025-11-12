import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getAllTeams = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("teams"),
      _creationTime: v.number(),
      name: v.string(),
      organizationId: v.id("organizations"),
      createdAt: v.number(),
      createdBy: v.id("users"),
    }),
  ),
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
  returns: v.array(
    v.object({
      membershipId: v.id("teamMemberships"),
      userId: v.id("users"),
      role: v.union(v.literal("viewer"), v.literal("editor"), v.literal("admin")),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      image: v.optional(v.string()),
    }),
  ),
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

export const getProjectTeams = query({
  args: { projectId: v.id("projects") },
  returns: v.array(v.any()),
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
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const teamProjects = await ctx.db
      .query("teamProjects")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const projects = await Promise.all(
      teamProjects.map((tp) => ctx.db.get(tp.projectId)),
    );

    return teamProjects
      .map((tp, i) =>
        projects[i] ? { ...projects[i], assignmentId: tp._id } : null,
      )
      .filter(Boolean);
  },
});

export const getUserTeamMemberships = query({
  args: { userId: v.id("users") },
  returns: v.array(
    v.object({
      _id: v.id("teamMemberships"),
      teamId: v.id("teams"),
      teamName: v.string(),
      role: v.union(v.literal("viewer"), v.literal("editor"), v.literal("admin")),
      projectCount: v.number(),
    }),
  ),
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
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user?.organizationId) return [];

    const memberships = await ctx.db
      .query("teamMemberships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const projectMap = new Map<
      string,
      { project: any; teams: { name: string; role: string }[] }
    >();

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

import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getAllTeams = query({
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

export const getTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const team = await ctx.db.get(args.teamId);
    if (!team || team.organizationId !== user.organizationId) return null;
    return team;
  },
});

export const getUserTeams = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .collect();

    return teams
      .filter((team) => team.memberIds.includes(args.userId))
      .map((team) => ({
        teamId: team._id,
        teamName: team.name,
        projectCount: team.projectIds.length,
      }));
  },
});

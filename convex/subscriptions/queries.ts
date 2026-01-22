import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "../_generated/server";

export const getProjectLimits = query({
  args: {},
  returns: v.object({
    currentProjects: v.number(),
    maxProjects: v.union(v.number(), v.null()),
    canCreateMore: v.boolean(),
    isPremium: v.boolean(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        currentProjects: 0,
        maxProjects: null,
        canCreateMore: false,
        isPremium: true,
      };
    }

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) {
      return {
        currentProjects: 0,
        maxProjects: null,
        canCreateMore: false,
        isPremium: true,
      };
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .collect();

    return {
      currentProjects: projects.length,
      maxProjects: null,
      canCreateMore: true,
      isPremium: true,
    };
  },
});

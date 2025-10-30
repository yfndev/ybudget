import { query } from "../../_generated/server";
import { getAuthenticatedUser } from "../../utils/auth";

export const getAllProjects = query({
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
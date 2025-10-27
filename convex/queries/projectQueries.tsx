import { query } from "../_generated/server";
import { getAuthenticatedUser } from "../utils/auth";

export const getProjects = query({
  handler: async (ctx, args) => {
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

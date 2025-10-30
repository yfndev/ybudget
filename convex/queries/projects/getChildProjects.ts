import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { query } from "../../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";



export const getChildProjects = query({
  args: { parentId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId)
      )
      .filter((q) => q.eq(q.field("parentId"), args.parentId as Id<"projects">))
      .collect();
    return projects;
  },
});

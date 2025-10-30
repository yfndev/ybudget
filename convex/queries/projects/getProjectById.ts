import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { query } from "../../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getProjectById = query({
  args: { projectId: v.string() },

  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const project = await ctx.db.get(args.projectId as Id<"projects">);
    return project;
  },
});
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    parentId: v.optional(v.id("projects")),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthenticated");
    }

    await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      organizationId: args.organizationId,
      parentId: args.parentId,
      isActive: true,
      createdBy: userId,
    });
  },
});

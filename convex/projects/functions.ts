import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";
import { requireRole } from "../users/permissions";

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "editor");
    const user = await getCurrentUser(ctx);

    return await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      organizationId: user.organizationId,
      parentId: args.parentId,
      isActive: true,
      createdBy: user._id,
    });
  },
});

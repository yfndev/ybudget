import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const addProject = mutation({
  args: {
    name: v.string(),
    description: v.string(),

    parentId: v.optional(v.id("projects")),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      organizationId: args.organizationId,
      parentId: args.parentId,
      isActive: true,
    });
  },
});

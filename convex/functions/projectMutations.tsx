import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const addProject = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    description: v.string(),
    parentId: v.string(),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    await ctx.db.insert("projects", {
      id: args.id,
      name: args.name,
      description: args.description,
      organizationId: args.organizationId,
      parentId: "",
      isActive: true,
    });
  },
});

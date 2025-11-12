import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "./getCurrentUser";

export const addUserToOrganization = mutation({
  args: {
    userId: v.id("users"),
    organizationId: v.id("organizations"),
    role: v.optional(
      v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      organizationId: args.organizationId,
      role: args.role ?? "editor",
    });
    return null;
  },
});

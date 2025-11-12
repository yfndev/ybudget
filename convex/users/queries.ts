import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalQuery, query } from "../_generated/server";
import { getCurrentUser } from "./getCurrentUser";
import { requireRole } from "./permissions";

export const getUserOrganizationId = query({
  args: {},
  returns: v.union(v.id("organizations"), v.null()),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return user.organizationId ?? null;
  },
});

export const getCurrentUserProfile = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await getCurrentUser(ctx);
  },
});

export const getCurrentUserInternal = internalQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const listOrganizationUsers = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("users"),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      image: v.optional(v.string()),
      role: v.union(
        v.literal("admin"),
        v.literal("editor"),
        v.literal("viewer"),
      ),
    }),
  ),
  handler: async (ctx) => {
    await requireRole(ctx, "admin");
    const user = await getCurrentUser(ctx);

    const users = await ctx.db
      .query("users")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .collect();

    return users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      image: u.image,
      role: (u.role || "viewer") as "admin" | "editor" | "viewer",
    }));
  },
});
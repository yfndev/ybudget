import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../_generated/server";
import { getCurrentUser } from "./getCurrentUser";
import { requireRole } from "./permissions";

export const getUserOrganizationId = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return user.organizationId;
  },
});

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return userId ? await ctx.db.get(userId) : null;
  },
});

export const listOrganizationUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, "admin");
    const user = await getCurrentUser(ctx);

    const users = await ctx.db
      .query("users")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId)
      )
      .collect();

    return users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role || "viewer",
    }));
  },
});

import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../_generated/server";
import { getCurrentUser } from "./getCurrentUser";
import { requireRole } from "./permissions";

export const getUserOrganizationId = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return ctx.db.get(userId).then((u) => u?.organizationId ?? null);
  },
});

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return ctx.db.get(userId);
  },
});

export const listOrganizationUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, "admin");
    const user = await getCurrentUser(ctx);
    return ctx.db
      .query("users")
      .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
      .collect();
  },
});

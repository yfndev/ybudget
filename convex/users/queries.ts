import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../_generated/server";
import { getCurrentUser } from "./getCurrentUser";

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

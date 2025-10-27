import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../_generated/server";

export const getOrganizationName = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const user = await ctx.db.get(userId);

    if (!user?.organizationId) return;

    const organization = await ctx.db.get(user.organizationId);
    return organization?.name;
  },
});

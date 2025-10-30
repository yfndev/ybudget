import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../../_generated/server";



export const getUserOrganizationId = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const user = await ctx.db.get(userId);
    if (!user) return false;
    
    return !user.organizationId;
  },
});


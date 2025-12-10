import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getOrganizationByDomain = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const domain = user.email?.split("@")[1];
    if (!domain) return { exists: false };

    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_domain", (q) => q.eq("domain", domain))
      .first();

    if (!organization) return { exists: false };

    return { exists: true, organizationName: organization.name };
  },
});

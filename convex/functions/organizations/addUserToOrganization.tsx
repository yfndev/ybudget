import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "../../_generated/server";

export const addUserToOrganization = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not found");

    const user = await ctx.db.get(userId);

    if (!user?.email) throw new Error("User Mail not found");
    const domain = user.email.split("@")[1];
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_domain", (q) => q.eq("domain", domain))
      .first();

    await ctx.db.patch(user._id, { organizationId: org?._id });
    return org?._id;
  },
});

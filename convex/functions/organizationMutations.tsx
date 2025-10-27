import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const addOrganization = mutation({
  args: {
    name: v.string(),
    domain: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    const user = await ctx.db.get(userId);
    if (!user) return;

    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      domain: args.domain,
      createdBy: userId,
    });

    await ctx.db.patch(user._id, { organizationId });
    return organizationId;
  },
});

export const joinExistingOrganization = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const user = await ctx.db.get(userId);

    if (!user?.email) return;
    const domain = user.email.split("@")[1];
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_domain", (q) => q.eq("domain", domain))
      .first();

    await ctx.db.patch(user._id, { organizationId: org?._id });
    return org?._id;
  },
});


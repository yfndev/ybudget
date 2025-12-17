import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const initializeOrganization = mutation({
  args: {
    organizationName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized user");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (user.organizationId) {
      return { organizationId: user.organizationId, isNew: false };
    }

    const domain = user.email?.split("@")[1];
    if (!domain) throw new Error("Could not find a domain for this E-Mail");

    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_domain", (q) => q.eq("domain", domain))
      .first();

    if (existingOrg) {
      await ctx.db.patch(user._id, {
        organizationId: existingOrg._id,
        role: "member",
      });
      return { organizationId: existingOrg._id, isNew: false };
    }

    const organizationId = await ctx.db.insert("organizations", {
      name: args.organizationName ?? `${domain} Organization`,
      domain,
      createdBy: user._id,
    });

    await ctx.db.insert("projects", {
      name: "Rücklagen",
      organizationId,
      isArchived: false,
      createdBy: user._id,
    });

    await ctx.db.patch(user._id, { organizationId, role: "admin" });

    return { organizationId, isNew: true };
  },
});

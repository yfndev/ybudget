import { v } from "convex/values";
import { mutation, query } from "../_generated/server";


export const checkOrganizationExists = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const domain = args.email.split("@")[1];

    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_domain", (q) => q.eq("domain", domain))
      .first();

    return !!organization;
  },
});

export const addOrganization = mutation({
  args: {
    name: v.string(),
    domain: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    await ctx.db.insert("organizations", {
      name: args.name,
      domain: args.domain,
      createdBy: identity.subject,
    });
  },
});

export const assignUserToOrganizationByDomain = mutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const domain = args.email.split("@")[1];

    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_domain", (q) => q.eq("domain", domain))
      .first();

    if (organization) {
      const user = await ctx.db.get(args.userId);

      if (user && !user.organizationId) {
        await ctx.db.patch(user._id, {
          organizationId: organization._id,
        });
      }
    }
  },
});

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { mutation } from "../_generated/server";

function getUserDomain(email: string | undefined): string | null {
  if (!email) return null;
  const domain = email.split("@")[1];
  return domain || null;
}

export const findOrganizationByDomain = mutation({
  args: {
    domain: v.string(),
  },

  handler: async (ctx, args) => {
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_domain", (q) => q.eq("domain", args.domain))
      .first();

    return organization?._id ?? null;
  },
});

export const createOrganization = mutation({
  args: {
    name: v.string(),
    domain: v.string(),
    userId: v.id("users"),
  },
  returns: v.id("organizations"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("organizations", {
      name: args.name,
      domain: args.domain,
      createdBy: args.userId,
    });
  },
});

export const setupUserOrganization = mutation({
  args: {
    organizationName: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not found");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (user.organizationId) return user.organizationId;

    const domain = getUserDomain(user.email);
    if (!domain) throw new Error("Email domain not found");

    const existingOrgId = (await ctx.runMutation(
      api.organizations.functions.findOrganizationByDomain,
      { domain }
    )) as Id<"organizations"> | null;

    if (existingOrgId) {
      await ctx.runMutation(api.users.functions.addUserToOrganization, {
        userId,
        organizationId: existingOrgId,
      });
      return existingOrgId;
    }

    const organizationId = (await ctx.runMutation(
      api.organizations.functions.createOrganization,
      {
        name: args.organizationName ?? `${domain} Organization`,
        domain,
        userId,
      }
    )) as Id<"organizations">;

    await ctx.runMutation(api.users.functions.addUserToOrganization, {
      userId,
      organizationId,
    });

    return organizationId;
  },
});

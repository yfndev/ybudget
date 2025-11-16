import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { mutation, type MutationCtx } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

function getUserDomain(email: string | undefined): string | null {
  if (!email) return null;
  const domain = email.split("@")[1];
  return domain || null;
}

async function getOrganizationByDomain(
  ctx: MutationCtx,
  domain: string,
): Promise<Id<"organizations"> | null> {
  const organization = await ctx.db
    .query("organizations")
    .withIndex("by_domain", (q) => q.eq("domain", domain))
    .first();

  return organization?._id ?? null;
}

async function addUserToOrganization(
  ctx: MutationCtx,
  userId: Id<"users">,
  organizationId: Id<"organizations">,
  role: "admin" | "editor" | "viewer",
): Promise<void> {
  await ctx.db.patch(userId, {
    organizationId,
    role,
  });
}

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
  returns: v.union(
    v.object({
      organizationId: v.id("organizations"),
      isNew: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (user.organizationId) {
      return {
        organizationId: user.organizationId,
        isNew: false,
      };
    }

    const domain = getUserDomain(user.email);
    if (!domain) throw new Error("Email domain not found");

    const existingOrgId = await getOrganizationByDomain(ctx, domain);

    if (existingOrgId) {
      await addUserToOrganization(ctx, user._id, existingOrgId, "viewer");
      return {
        organizationId: existingOrgId,
        isNew: false,
      };
    }

    const organizationId = await ctx.db.insert("organizations", {
      name: args.organizationName ?? `${domain} Organization`,
      domain,
      createdBy: user._id,
    });

    await addUserToOrganization(ctx, user._id, organizationId, "admin");

    return {
      organizationId,
      isNew: true,
    };
  },
});

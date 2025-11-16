import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";
import { requireRole } from "../users/permissions";

const FREE_TIER_LIMIT = 3;

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "editor");
    const user = await getCurrentUser(ctx);

    const activePayment = await ctx.db
      .query("payments")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .first();
    
    const isPremium = activePayment !== null;

    if (!isPremium) {
      const existingProjects = await ctx.db
        .query("projects")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId),
        )
        .collect();

      if (existingProjects.length >= FREE_TIER_LIMIT) {
        throw new Error(
          `Du hast das Limit von ${FREE_TIER_LIMIT} Projekten erreicht. Bitte upgrade auf Premium.`,
        );
      }
    }

    return await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      organizationId: user.organizationId,
      parentId: args.parentId,
      isActive: true,
      createdBy: user._id,
    });
  },
});

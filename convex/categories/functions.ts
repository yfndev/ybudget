import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";
import { requireRole } from "../users/permissions";

export const createCategory = mutation({
  args: {
    name: v.string(),

    taxsphere: v.union(
      v.literal("non-profit"),
      v.literal("asset-management"),
      v.literal("purpose-operations"),
      v.literal("commercial-operations"),
    ),
    parentId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");
    const user = await getCurrentUser(ctx);
    return ctx.db.insert("categories", {
      name: args.name,
      taxsphere: args.taxsphere,
      approved: false,
      createdBy: user._id,
      parentId: args.parentId,
    });
  },
});

export const getAllCategories = query({
  handler: async (ctx) => {
    return ctx.db.query("categories").collect();
  },
});

import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getAllDonors = query({
  args: {},

  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    return await ctx.db
      .query("donors")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId)
      )
      .collect();
  },
});

export const getDonorById = query({
  args: { donorId: v.id("donors") },

  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    return await ctx.db
      .query("donors")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId)
      )
      .filter((q) => q.eq(q.field("_id"), args.donorId))
      .first();
  },
});

export const getDonorTransactions = query({
  args: { donorId: v.id("donors") },

  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    return await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId)
      )
      .filter((q) => q.eq(q.field("donorId"), args.donorId))
      .collect();
  },
});

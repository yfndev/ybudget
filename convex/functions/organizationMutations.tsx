import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const addOrganization = mutation({
  args: {
    id: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    await ctx.db.insert("organizations", {
      id: args.id,
      name: args.name,
      createdBy: identity.subject,
    });
  },
});

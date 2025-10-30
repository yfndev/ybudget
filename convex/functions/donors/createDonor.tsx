import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getCurrentUser } from "../../queries/users/getCurrentUser";

export const createDonor = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("donation"), v.literal("sponsoring")),
  },
  returns: v.id("donors"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthenticated");
    }

    return await ctx.db.insert("donors", {
      name: args.name,
      type: args.type,
      organizationId: user.organizationId,
      createdBy: user._id,
    });
  },
});

import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";
import { requireRole } from "../users/permissions";

export const createDonor = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("donation"), v.literal("sponsoring")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "editor");
    const user = await getCurrentUser(ctx);
    return ctx.db.insert("donors", {
      name: args.name,
      type: args.type,
      organizationId: user.organizationId,
      createdBy: user._id,
    });
  },
});

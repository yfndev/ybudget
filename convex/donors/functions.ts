import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";
import { requireRole } from "../users/permissions";

export const createDonor = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("donation"), v.literal("sponsoring")),
    allowedTaxSpheres: v.array(
      v.union(
        v.literal("non-profit"),
        v.literal("asset-management"),
        v.literal("purpose-operations"),
        v.literal("commercial-operations"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "lead");
    const user = await getCurrentUser(ctx);
    return ctx.db.insert("donors", {
      name: args.name,
      type: args.type,
      allowedTaxSpheres: args.allowedTaxSpheres,
      organizationId: user.organizationId,
      createdBy: user._id,
    });
  },
});

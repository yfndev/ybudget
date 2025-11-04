import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";


export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    taxCostposition: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    return ctx.db.insert("categories", {
      name: args.name,
      description: args.description,
      taxCostposition: args.taxCostposition,
      approved: false,
      createdBy: user._id,
    });
  },
});
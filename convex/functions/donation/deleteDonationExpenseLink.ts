import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getCurrentUser } from "../../queries/users/getCurrentUser";

export const deleteDonationExpenseLink = mutation({
    args: {
      linkId: v.id("donationExpenseLinks"),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
      const user = await getCurrentUser(ctx);
      if (!user) throw new Error("Unauthenticated");
  
      const link = await ctx.db.get(args.linkId);
      if (!link || link.organizationId !== user.organizationId) {
        throw new Error("Link not found");
      }
  
      await ctx.db.delete(args.linkId);
      return null;
    },
  });
  
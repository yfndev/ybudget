import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getDonorById = query({
    args: { donorId: v.id("donors") },
    returns: v.union(
      v.object({
        _id: v.id("donors"),
        name: v.string(),
        type: v.union(v.literal("donation"), v.literal("sponsoring")),
        totalAgreed: v.number(),
        totalPaid: v.number(),
        totalOpen: v.number(),
      }),
      v.null()
    ),
    handler: async (ctx, args) => {
      const user = await getCurrentUser(ctx);
      if (!user) return null;
  
      const donor = await ctx.db.get(args.donorId);
      if (!donor || donor.organizationId !== user.organizationId) {
        return null;
      }
  
      const transactions = await ctx.db
        .query("transactions")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId)
        )
        .filter((q) =>
          q.and(
            q.gt(q.field("amount"), 0),
            q.neq(q.field("donorId"), ""),
            q.eq(q.field("donorId"), args.donorId.toString())
          )
        )
        .collect();
  
      const totalAgreed = transactions.reduce(
        (sum, t) => sum + (typeof t.amount === "number" && !isNaN(t.amount) ? t.amount : 0),
        0
      );
      const totalPaid = transactions
        .filter((t) => t.status === "processed")
        .reduce(
          (sum, t) => sum + (typeof t.amount === "number" && !isNaN(t.amount) ? t.amount : 0),
          0
        );
      const totalOpen = Math.max(0, totalAgreed - totalPaid);
  
      return {
        _id: donor._id,
        name: donor.name,
        type: donor.type,
        totalAgreed: isNaN(totalAgreed) ? 0 : totalAgreed,
        totalPaid: isNaN(totalPaid) ? 0 : totalPaid,
        totalOpen: isNaN(totalOpen) ? 0 : totalOpen,
      };
    },
  });
  
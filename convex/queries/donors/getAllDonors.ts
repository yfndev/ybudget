import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getAuthenticatedUser } from "../../utils/auth";

export const getAllDonors = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("donors"),
      name: v.string(),
      type: v.union(v.literal("donation"), v.literal("sponsoring")),
      totalAgreed: v.number(),
      totalPaid: v.number(),
      totalOpen: v.number(),
    })
  ),
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const donors = await ctx.db
      .query("donors")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId)
      )
      .collect();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId)
      )
      .filter((q) => q.and(q.gt(q.field("amount"), 0), q.neq(q.field("donorId"), "")))
      .collect();

    return donors.map((donor) => {
      const donorId = donor._id.toString();
      const donorTransactions = transactions.filter(
        (t) => t.donorId === donorId
      );

      const totalAgreed = donorTransactions.reduce(
        (sum, t) => sum + (typeof t.amount === "number" && !isNaN(t.amount) ? t.amount : 0),
        0
      );

      const totalPaid = donorTransactions
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
    });
  },
});


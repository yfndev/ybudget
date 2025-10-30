import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getAuthenticatedUser } from "../../utils/auth";

export const getAvailableDonationsForProject = query({
  args: { projectId: v.string() },
  returns: v.array(
    v.object({
      donationId: v.id("transactions"),
      donorName: v.string(),
      donationAmount: v.number(),
      availableAmount: v.number(),
      date: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const projectTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("projectId"), args.projectId),
          q.gt(q.field("amount"), 0),
          q.neq(q.field("donorId"), ""),
          q.eq(q.field("status"), "processed") // only actual donations, not expected ones
        )
      )
      .collect();

    const donors = await ctx.db.query("donors").collect();
    const donorMap = new Map(donors.map((d) => [d._id.toString(), d]));

    const donationTransactions = projectTransactions.filter((transaction) => {
      const donor = donorMap.get(transaction.donorId);
      return donor?.type === "donation";
    });

    const links = await ctx.db
      .query("donationExpenseLinks")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId)
      )
      .collect();

    const linkMap = new Map<string, number>();
    for (const link of links) {
      const donationId = link.donationId.toString();
      linkMap.set(
        donationId,
        (linkMap.get(donationId) || 0) + link.amount
      );
    }

    return donationTransactions
      .map((donation) => {
        const linkedAmount =
          linkMap.get(donation._id.toString()) || 0;
        const donor = donorMap.get(donation.donorId);

        return {
          donationId: donation._id,
          donorName: donor?.name || "Unbekannt",
          donationAmount: donation.amount,
          availableAmount: donation.amount - linkedAmount,
          date: donation.date,
        };
      })
      .filter((d) => d.availableAmount > 0)
      .sort((a, b) => b.date - a.date);
  },
});


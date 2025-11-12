import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getAllDonors = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return ctx.db
      .query("donors")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .collect();
  },
});

export const getEligibleDonorsForCategory = query({
  args: {
    donorId: v.id("donors"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const [donor, transactions] = await Promise.all([
      ctx.db
        .query("donors")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId),
        )
        .filter((q) => q.eq(q.field("_id"), args.donorId))
        .first(),
      ctx.db
        .query("transactions")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId),
        )
        .filter((q) => q.eq(q.field("donorId"), args.donorId))
        .collect(),
    ]);

    if (!donor) throw new Error("Donor not found");

    let committedIncome = 0;
    let paidIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
      if (transaction.amount > 0) {
        if (transaction.status === "expected")
          committedIncome += transaction.amount;
        if (transaction.status === "processed")
          paidIncome += transaction.amount;
      } else {
        totalExpenses += Math.abs(transaction.amount);
      }
    });

    return {
      donor: { _id: donor._id, name: donor.name, type: donor.type },
      committedIncome,
      paidIncome,
      openIncome: committedIncome - paidIncome,
      totalExpenses,
    };
  },
});

export const getDonorTransactions = query({
  args: { donorId: v.id("donors") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    return ctx.db
      .query("transactions")
      .withIndex("by_organization_donor", (q) =>
        q.eq("organizationId", user.organizationId).eq("donorId", args.donorId),
      )
      .collect();
  },
});

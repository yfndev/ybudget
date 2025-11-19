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

export const getDonorById = query({
  args: { donorId: v.id("donors") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const donor = await ctx.db.get(args.donorId);
    if (!donor) throw new Error("Donor not found");
    if (donor.organizationId !== user.organizationId)
      throw new Error("Unauthorized");

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization_donor", (q) =>
        q.eq("organizationId", user.organizationId).eq("donorId", args.donorId),
      )
      .collect();

    let committedIncome = 0;
    let paidIncome = 0;
    let totalExpenses = 0;

    for (const transaction of transactions) {
      if (transaction.amount > 0) {
        if (transaction.status === "expected")
          committedIncome += transaction.amount;
        if (transaction.status === "processed")
          paidIncome += transaction.amount;
      } else {
        totalExpenses += Math.abs(transaction.amount);
      }
    }

    return {
      ...donor,
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

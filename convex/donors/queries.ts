import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getAllDonors = query({
  args: {},

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

export const getDonorsByProject = query({
  args: { projectId: v.id("projects") },

  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const transactionsWithDonors = await ctx.db
      .query("transactions")
      .withIndex("by_organization_project_donor", (q) =>
        q
          .eq("organizationId", user.organizationId)
          .eq("projectId", args.projectId),
      )
      .filter((q) => q.neq(q.field("donorId"), undefined))
      .collect();

    const uniqueDonorIds = new Set<Id<"donors">>();
    const donorMap = new Map<
      Id<"donors">,
      (typeof transactionsWithDonors)[0]
    >();

    for (const transaction of transactionsWithDonors) {
      if (transaction.donorId && !uniqueDonorIds.has(transaction.donorId)) {
        uniqueDonorIds.add(transaction.donorId);
        donorMap.set(transaction.donorId, transaction);
      }
    }

    const donors = await Promise.all(
      Array.from(uniqueDonorIds).map((donorId) => ctx.db.get(donorId)),
    );

    return donors.filter(
      (donor): donor is NonNullable<typeof donor> => donor !== null,
    );
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

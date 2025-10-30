import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { mutation } from "../../_generated/server";
import { getCurrentUser } from "../../queries/users/getCurrentUser";

export const createDonationExpenseLink = mutation({
  args: {
    expenseId: v.id("transactions"),
    donationId: v.id("transactions"),
  },
  returns: v.id("donationExpenseLinks"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthenticated");

    const expense = await ctx.db.get(args.expenseId);
    if (!expense || expense.organizationId !== user.organizationId) {
      throw new Error("Expense not found");
    }

    const donation = await ctx.db.get(args.donationId);
    if (!donation || donation.organizationId !== user.organizationId) {
      throw new Error("Donation not found");
    }

    const donor = await ctx.db.get(donation.donorId as Id<"donors">);

    const existingLinks = await ctx.db
      .query("donationExpenseLinks")
      .withIndex("by_donation", (q) => q.eq("donationId", args.donationId))
      .collect();

    const linkedToDonation = existingLinks.reduce(
      (sum, link) => sum + link.amount,
      0
    );
    const availableAmount = donation.amount - linkedToDonation;

    if (availableAmount <= 0) {
      throw new Error("Donation has no available budget");
    }

    const expenseLinks = await ctx.db
      .query("donationExpenseLinks")
      .withIndex("by_expense", (q) => q.eq("expenseId", args.expenseId))
      .collect();

    const linkedToExpense = expenseLinks.reduce(
      (sum, link) => sum + link.amount,
      0
    );
    const expenseRemaining = Math.abs(expense.amount) - linkedToExpense;

    if (expenseRemaining <= 0) {
      throw new Error("Expense is already fully allocated");
    }

    const linkAmount = Math.min(availableAmount, expenseRemaining);

    return await ctx.db.insert("donationExpenseLinks", {
      expenseId: args.expenseId,
      donationId: args.donationId,
      amount: linkAmount,
      organizationId: user.organizationId,
      createdBy: user._id,
    });
  },
});

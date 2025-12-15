import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { api } from "../_generated/api";

const dateRangeArgs = z.object({
  startDate: z.string().optional().describe("Start date in YYYY-MM-DD format"),
  endDate: z.string().optional().describe("End date in YYYY-MM-DD format"),
});

function filterByDateRange<T extends { date: number }>(
  items: T[],
  startDate?: string,
  endDate?: string,
): T[] {
  if (!startDate && !endDate) return items;
  const start = startDate ? new Date(startDate).getTime() : 0;
  const end = endDate ? new Date(endDate).getTime() : Date.now();
  return items.filter((item) => item.date >= start && item.date <= end);
}

export const getFinancialSummary = createTool({
  description:
    "Get financial summary with balance, expected income/expenses. Optionally filter by date range.",
  args: dateRangeArgs,
  handler: async (
    ctx,
    args,
  ): Promise<{
    currentBalance: number;
    expectedIncome: number;
    expectedExpenses: number;
    availableBudget: number;
    transactionCount: number;
  }> => {
    const all = await ctx.runQuery(
      api.transactions.queries.getAllTransactions,
      {},
    );
    const transactions = filterByDateRange(all, args.startDate, args.endDate);

    let balance = 0;
    let expectedIncome = 0;
    let expectedExpenses = 0;

    for (const transaction of transactions) {
      if (transaction.status === "processed") balance += transaction.amount;
      if (transaction.status === "expected") {
        if (transaction.amount > 0) expectedIncome += transaction.amount;
        else expectedExpenses += transaction.amount;
      }
    }

    const available = balance + expectedIncome + expectedExpenses;

    return {
      currentBalance: balance / 100,
      expectedIncome: expectedIncome / 100,
      expectedExpenses: Math.abs(expectedExpenses) / 100,
      availableBudget: Math.max(available / 100, 0),
      transactionCount: transactions.length,
    };
  },
});

export const getProjects = createTool({
  description: "Get all projects of the organization",
  args: z.object({}),
  handler: async (
    ctx,
  ): Promise<
    Array<{
      id: string;
      name: string;
      description: string | undefined;
      isArchived: boolean;
    }>
  > => {
    const projects = await ctx.runQuery(
      api.projects.queries.getAllProjects,
      {},
    );
    return projects.map((project) => ({
      id: project._id,
      name: project.name,
      description: project.description,
      isArchived: project.isArchived,
    }));
  },
});

export const getCategories = createTool({
  description: "Get all categories grouped by tax sphere",
  args: z.object({}),
  handler: async (
    ctx,
  ): Promise<Record<string, Array<{ id: string; name: string }>>> => {
    const categories = await ctx.runQuery(
      api.categories.functions.getAllCategories,
      {},
    );

    const grouped: Record<string, Array<{ id: string; name: string }>> = {
      "non-profit": [],
      "asset-management": [],
      "purpose-operations": [],
      "commercial-operations": [],
    };

    for (const category of categories) {
      grouped[category.taxsphere]?.push({
        id: category._id,
        name: category.name,
      });
    }

    return grouped;
  },
});

export const getDonors = createTool({
  description: "Get all donors of the organization",
  args: z.object({}),
  handler: async (
    ctx,
  ): Promise<
    Array<{
      id: string;
      name: string;
      type: string;
      allowedTaxSpheres: string[];
    }>
  > => {
    const donors = await ctx.runQuery(api.donors.queries.getAllDonors, {});
    return donors.map((donor) => ({
      id: donor._id,
      name: donor.name,
      type: donor.type,
      allowedTaxSpheres: donor.allowedTaxSpheres,
    }));
  },
});

export const getRecentTransactions = createTool({
  description:
    "Get transactions, optionally filtered by date range. Returns max 20.",
  args: dateRangeArgs.extend({
    limit: z.number().optional().describe("Number of transactions (max 20)"),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<
    Array<{
      date: string;
      amount: number;
      description: string;
      counterparty: string;
      project: string | undefined;
      category: string | undefined;
      status: string;
    }>
  > => {
    const all = await ctx.runQuery(
      api.transactions.queries.getAllTransactions,
      {},
    );
    const filtered = filterByDateRange(all, args.startDate, args.endDate);
    const limit = Math.min(args.limit ?? 10, 20);

    return filtered
      .sort((first, second) => second.date - first.date)
      .slice(0, limit)
      .map((transaction) => ({
        date: new Date(transaction.date).toLocaleDateString("de-DE"),
        amount: transaction.amount / 100,
        description: transaction.description,
        counterparty: transaction.counterparty,
        project: transaction.projectName,
        category: transaction.categoryName,
        status: transaction.status,
      }));
  },
});

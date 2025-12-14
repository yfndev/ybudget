import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { api } from "../_generated/api";

const filterByDateRange = <T extends { date: number }>(
  items: T[],
  startDate?: string,
  endDate?: string,
): T[] => {
  if (!startDate && !endDate) return items;

  const start = startDate ? new Date(startDate).getTime() : 0;
  const end = endDate ? new Date(endDate).getTime() : Date.now();

  return items.filter((item) => item.date >= start && item.date <= end);
};

export const getFinancialSummary = createTool({
  description:
    "Get financial summary: current balance, expected income/expenses, available budget. Optionally filter by date range.",
  args: z.object({
    startDate: z
      .string()
      .optional()
      .describe("Start date in YYYY-MM-DD format"),
    endDate: z.string().optional().describe("End date in YYYY-MM-DD format"),
  }),
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
    const allTransactions = await ctx.runQuery(
      api.transactions.queries.getAllTransactions,
      {},
    );

    const transactions = filterByDateRange(
      allTransactions,
      args.startDate,
      args.endDate,
    );

    let currentBalance = 0;
    let expectedIncome = 0;
    let expectedExpenses = 0;

    for (const transaction of transactions) {
      if (transaction.status === "processed") {
        currentBalance += transaction.amount;
      }
      if (transaction.status === "expected") {
        if (transaction.amount > 0) expectedIncome += transaction.amount;
        else expectedExpenses += transaction.amount;
      }
    }

    const availableBudget =
      currentBalance + expectedIncome + expectedExpenses > 0
        ? currentBalance + expectedIncome + expectedExpenses
        : 0;

    return {
      currentBalance: currentBalance / 100,
      expectedIncome: expectedIncome / 100,
      expectedExpenses: Math.abs(expectedExpenses) / 100,
      availableBudget: availableBudget / 100,
      transactionCount: transactions.length,
    };
  },
});

export const getProjects = createTool({
  description: "Get all projects of the organization",
  args: z.object({}),
  handler: async (ctx): Promise<
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
  description:
    "Get all categories grouped by tax sphere (non-profit, asset-management, purpose-operations, commercial-operations)",
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
  handler: async (ctx): Promise<
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
    "Get transactions, optionally filtered by date range. Returns max 20 transactions.",
  args: z.object({
    limit: z.number().optional().describe("Number of transactions (max 20)"),
    startDate: z
      .string()
      .optional()
      .describe("Start date in YYYY-MM-DD format"),
    endDate: z.string().optional().describe("End date in YYYY-MM-DD format"),
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
    const allTransactions = await ctx.runQuery(
      api.transactions.queries.getAllTransactions,
      {},
    );

    const filtered = filterByDateRange(
      allTransactions,
      args.startDate,
      args.endDate,
    );

    const limit = Math.min(args.limit ?? 10, 20);
    const sorted = [...filtered]
      .sort((first, second) => second.date - first.date)
      .slice(0, limit);

    return sorted.map((transaction) => ({
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

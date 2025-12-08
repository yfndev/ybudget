import type { Doc } from "@/convex/_generated/dataModel";

export const calculateBudget = (
  transactions: Doc<"transactions">[],
  budgets: Doc<"budgets">[] = [],
) => {
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

  const totalBudgeted = budgets.reduce(
    (sum, budget) => sum + budget.amount,
    0,
  );
  currentBalance += totalBudgeted;

  const availableBudget =
    currentBalance + expectedIncome + expectedExpenses > 0
      ? currentBalance + expectedIncome + expectedExpenses
      : 0;

  return {
    currentBalance,
    expectedIncome,
    expectedExpenses: Math.abs(expectedExpenses),
    availableBudget,
    totalBudgeted,
  };
};

export const calculateProgressPercentage = (
  transactions: Doc<"transactions">[],
): number => {
  const totalIncome = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

  return totalIncome === 0
    ? 0
    : Math.min(100, (totalExpenses / totalIncome) * 100);
};

export const calculateUnbudgeted = (
  transactionAmount: number,
  budgets: Doc<"budgets">[],
): number => {
  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  return transactionAmount - totalBudgeted;
};

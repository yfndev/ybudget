import type { Doc } from "@/convex/_generated/dataModel";

export const calculateBudget = (
  transactions: Doc<"transactions">[],
  budgetAllocations: Doc<"budgets">[] = [],
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

  const allocatedBudget = budgetAllocations.reduce(
    (sum, budget) => sum + budget.amount,
    0,
  );
  currentBalance += allocatedBudget;

  const availableBudget =
    currentBalance + expectedIncome + expectedExpenses > 0
      ? currentBalance + expectedIncome + expectedExpenses
      : 0;

  return {
    currentBalance,
    expectedIncome,
    expectedExpenses: Math.abs(expectedExpenses),
    availableBudget,
    allocatedBudget,
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

export const calculateUnallocated = (
  transactionAmount: number,
  allocations: Doc<"budgets">[],
): number => {
  const totalAllocated = allocations.reduce((sum, b) => sum + b.amount, 0);
  return transactionAmount - totalAllocated;
};

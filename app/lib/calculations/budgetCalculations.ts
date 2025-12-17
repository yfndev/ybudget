import type { Doc } from "@/convex/_generated/dataModel";

export const calculateBudget = (transactions: Doc<"transactions">[]) => {
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

  const availableBudget = Math.max(
    0,
    currentBalance + expectedIncome + expectedExpenses,
  );

  return {
    currentBalance,
    expectedIncome,
    expectedExpenses: Math.abs(expectedExpenses),
    availableBudget,
  };
};

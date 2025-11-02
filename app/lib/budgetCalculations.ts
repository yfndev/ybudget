import { Doc } from "../../convex/_generated/dataModel";

export const calculateBudget = (transactions: Doc<"transactions">[]) => {
  let currentBalance = 0;
  let expectedIncome = 0;
  let expectedExpenses = 0;

  for (const transaction of transactions) {
    if (transaction.status === "expected") {
      if (transaction.amount > 0) expectedIncome += transaction.amount;
      else expectedExpenses += transaction.amount;
    } else if (transaction.status === "processed") {
      currentBalance += transaction.amount;
    }
  }

  const availableBudget = currentBalance + expectedIncome - expectedExpenses;

  return {
    currentBalance,
    expectedIncome,
    expectedExpenses,
    availableBudget,
  };
}

export const calculateProgressPercentage = (
  transactions: Doc<"transactions">[]
): number => {
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return totalIncome === 0 ? 0 : Math.min(100, (totalExpenses / totalIncome) * 100);
}

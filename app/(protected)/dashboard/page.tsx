"use client";
import DashboardUI from "@/(protected)/dashboard/DashboardUI";
import { useDateRange } from "@/contexts/DateRangeContext";
import { api } from "@/convex/_generated/api";
import { calculateBudget } from "@/lib/budgetCalculations";
import { filterTransactionsByDateRange } from "@/lib/transactionFilters";
import { useQuery } from "convex-helpers/react/cache";

export default function Dashboard() {
  const { selectedDateRange } = useDateRange();
  const projects = useQuery(api.projects.queries.getAllProjects);
  const allTransactions = useQuery(
    api.transactions.queries.getAllTransactions,
    {},
  );

  const filteredTransactions = filterTransactionsByDateRange(
    allTransactions,
    selectedDateRange,
  );

  const budgets = calculateBudget(allTransactions ?? []);

  return (
    <DashboardUI
      projects={projects ?? []}
      transactions={filteredTransactions ?? []}
      budgets={budgets}
    />
  );
}

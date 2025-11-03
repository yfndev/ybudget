"use client";
import { useDateRange } from "@/contexts/DateRangeContext";
import { calculateBudget } from "@/lib/budgetCalculations";
import { filterTransactionsByDateRange } from "@/lib/transactionFilters";
import { useQuery } from "convex-helpers/react/cache";
import { api } from "../../../convex/_generated/api";
import DashboardUI from "./DashboardUI";

export default function Dashboard() {
  const { selectedDateRange } = useDateRange();
  const projects = useQuery(api.projects.queries.getAllProjects);
  const allTransactions = useQuery(
    api.transactions.queries.getAllTransactions,
    {}
  );

  const transactions = filterTransactionsByDateRange(
    allTransactions,
    selectedDateRange
  );

  const budgets = calculateBudget(transactions ?? []);

  return (
    <DashboardUI
      projects={projects ?? []}
      transactions={transactions ?? []}
      budgets={budgets}
    />
  );
}

"use client";
import BudgetCard from "@/components/Dashboard/BudgetCard";
import { CashflowChartUI } from "@/components/Dashboard/CashflowChartUI";
import { PageHeader } from "@/components/Layout/PageHeader";
import { api } from "@/convex/_generated/api";
import { calculateBudget } from "@/lib/calculations/budgetCalculations";
import { useQuery } from "convex-helpers/react/cache";

export default function Dashboard() {
  const transactions = useQuery(
    api.transactions.queries.getAllTransactions,
    {}
  );
  const { currentBalance, expectedIncome, expectedExpenses, availableBudget } =
    calculateBudget(transactions ?? []);

  return (
    <div>
      <PageHeader title="Dashboard" showRangeCalendar />
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        id="tour-budget-cards"
      >
        <BudgetCard
          title="Kontostand"
          amount={currentBalance}
          description="Verfügbarer Betrag auf dem Konto"
        />
        <BudgetCard
          title="Budget für Ausgaben"
          amount={availableBudget}
          description="Kontostand + geplante Einnahmen - geplante Ausgaben"
        />
        <BudgetCard
          title="Muss noch bezahlt werden"
          amount={expectedExpenses}
          description="Geplante Ausgaben, die noch nicht überwiesen wurden"
        />
        <BudgetCard
          title="Kommt noch rein"
          amount={expectedIncome}
          description="Geplante Einnahmen die noch nicht eingetroffen wurden"
        />
      </div>
      <div
        className="flex flex-col lg:flex-row w-full gap-4 lg:gap-6 mt-4 lg:mt-6"
        id="tour-chart"
      >
        <CashflowChartUI />
      </div>
    </div>
  );
}

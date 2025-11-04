import BudgetCard from "@/components/Dashboard/BudgetCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { SidebarInset } from "@/components/ui/sidebar";

import { CashflowChartUI } from "@/components/Dashboard/CashflowChartUI";
import ProjectCard from "@/components/Dashboard/ProjectCard";
import { calculateProgressPercentage } from "@/lib/budgetCalculations";
import type { Doc } from "../../../convex/_generated/dataModel";

interface DashboardUIProps {
  projects: Doc<"projects">[];
  transactions: Doc<"transactions">[];
  budgets: {
    currentBalance: number;
    expectedIncome: number;
    expectedExpenses: number;
    availableBudget: number;
  };
}

export default function DashboardUI({
  projects,
  transactions,
  budgets,
}: DashboardUIProps) {
  return (
    <SidebarInset>
      <div className="p-4 lg:px-6 pb-6 overflow-x-hidden w-full">
        <PageHeader title="Dashboard" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <BudgetCard
            title="Kontostand"
            amount={budgets.currentBalance}
            description="Verfügbarer Betrag auf dem Konto"
          />
          <BudgetCard
            title="Kommt noch rein"
            amount={budgets.expectedIncome}
            description="Zugesagtes Geld das noch nicht überwiesen wurde"
          />
          <BudgetCard
            title="Muss noch bezahlt werden"
            amount={budgets.expectedExpenses}
            description="Rechnungen und Zusagen die noch von uns bezahlt werden müssen"
          />
          <BudgetCard
            title="Kann ausgegeben werden"
            amount={budgets.availableBudget}
            description="Auf dem Konto + kommt rein - muss bezahlt werden"
          />
        </div>
        <div className="flex flex-col lg:flex-row w-full gap-4 lg:gap-6 mt-4 lg:mt-6">
          <CashflowChartUI />
        </div>

        <h2 className="text-xl font-semibold mb-4 mt-4 lg:mt-6">Projekte</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full gap-4 lg:gap-6">
          {projects?.map((project: Doc<"projects">) => {
            const projectTransactions =
              transactions?.filter((t) => t.projectId === project._id) ?? [];
            return (
              <ProjectCard
                key={project._id}
                title={project.name}
                description={project.description}
                progress={calculateProgressPercentage(projectTransactions)}
                projectId={project._id}
              />
            );
          })}
        </div>
      </div>
    </SidebarInset>
  );
}

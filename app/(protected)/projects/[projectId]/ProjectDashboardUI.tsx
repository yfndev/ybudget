import BudgetCard from "@/components/Dashboard/BudgetCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { EditableDataTable } from "@/components/Tables/EditableDataTable";
import { editableColumns } from "@/components/Tables/editableColumns";
import { SidebarInset } from "@/components/ui/sidebar";
import { PaginationStatus } from "convex/react";
import { Doc } from "../../../../convex/_generated/dataModel";

interface ProjectDashboardUIProps {
  project: Doc<"projects">;
  transactions: Doc<"transactions">[];
  budgets: {
    currentBalance: number;
    expectedIncome: number;
    expectedExpenses: number;
    availableBudget: number;
  };
  status: PaginationStatus;
  loadMore: (numItems: number) => void;
  onUpdate: (transactionId: string, field: string, value: any) => Promise<void>;
}

export default function ProjectDashboardUI({
  project,
  transactions,
  budgets,
  status,
  loadMore,
  onUpdate,
}: ProjectDashboardUIProps) {
  return (
    <SidebarInset>
      <div className="p-4 lg:px-6 pb-6 overflow-x-hidden w-full">
        <PageHeader title={project.name} showBackButton />

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

        <div className="mt-4 lg:mt-6">
          <h2 className="text-xl font-semibold mb-4">Transaktionen</h2>
          <EditableDataTable
            columns={editableColumns}
            data={transactions}
            onUpdate={onUpdate}
            paginationStatus={status}
            loadMore={() => loadMore(50)}
          />
        </div>
      </div>
    </SidebarInset>
  );
}

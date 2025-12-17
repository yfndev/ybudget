import { BudgetCard } from "@/components/Dashboard/BudgetCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { editableColumnsWithoutProject } from "@/components/Tables/Transactions/EditableColumns";
import { EditableDataTable } from "@/components/Tables/Transactions/EditableDataTable";
import { Button } from "@/components/ui/button";
import type { Doc } from "@/convex/_generated/dataModel";
import type { PaginationStatus } from "convex/react";

interface Props {
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
  onUpdate: (id: string, field: string, value: unknown) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onOpenTransfer: () => void;
}

export function ProjectDashboardUI({
  project,
  transactions,
  budgets,
  status,
  loadMore,
  onUpdate,
  onDelete,
  onOpenTransfer,
}: Props) {
  return (
    <div>
      <PageHeader title={project.name} showBackButton />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <BudgetCard
          title="Projekt Kontostand"
          amount={budgets.currentBalance}
          description="Verfügbarer Betrag des Projekts"
        />
        <BudgetCard
          title="Budget für Ausgaben"
          amount={budgets.availableBudget}
          description="Kontostand + geplante Einnahmen - geplante Ausgaben"
        />
        <BudgetCard
          title="Muss noch bezahlt werden"
          amount={budgets.expectedExpenses}
          description="Geplante Ausgaben, die noch nicht überwiesen wurden"
        />
        <BudgetCard
          title="Kommt noch rein"
          amount={budgets.expectedIncome}
          description="Geplante Einnahmen die noch nicht eingetroffen wurden"
        />
      </div>

      <div className="mt-4 lg:mt-6">
        <div className="flex flex-row justify-between my-4">
          <h2 className="text-xl font-semibold">Transaktionen</h2>
          <Button variant="outline" onClick={onOpenTransfer}>
            Geld übertragen
          </Button>
        </div>
        <EditableDataTable
          columns={editableColumnsWithoutProject}
          data={transactions}
          onUpdate={onUpdate}
          onDelete={onDelete}
          paginationStatus={status}
          loadMore={() => loadMore(50)}
        />
      </div>
    </div>
  );
}

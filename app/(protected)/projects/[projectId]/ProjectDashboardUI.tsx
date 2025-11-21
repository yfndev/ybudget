import BudgetCard from "@/components/Dashboard/BudgetCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { EditableDataTable } from "@/components/Tables/TransactionTable/EditableDataTable";
import { editableColumns } from "@/components/Tables/TransactionTable/editableColumns";
import { Button } from "@/components/ui/button";
import type { Doc } from "@/convex/_generated/dataModel";
import type { PaginationStatus } from "convex/react";
import { Archive } from "lucide-react";

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
  onDelete: (transactionId: string) => Promise<void>;
  openTransfer: () => void;
  onArchive: () => void;
}

export default function ProjectDashboardUI({
  project,
  transactions,
  budgets,
  status,
  loadMore,
  onUpdate,
  onDelete,
  openTransfer,
  onArchive,
}: ProjectDashboardUIProps) {
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
          description="Auf dem Konto + kommt rein - muss bezahlt werden"
        />
        <BudgetCard
          title="Muss noch bezahlt werden"
          amount={budgets.expectedExpenses}
          description="Rechnungen und Zusagen die noch von uns bezahlt werden müssen"
        />
        <BudgetCard
          title="Kommt noch rein"
          amount={budgets.expectedIncome}
          description="Zugesagtes Geld das noch nicht überwiesen wurde"
        />
      </div>

      <div className="mt-4 lg:mt-6">
        <div className="flex flex-row justify-between my-4">
          <h2 className="text-xl font-semibold ">Transaktionen</h2>
          <div className="flex gap-2 items-center">
            <Button variant="outline" onClick={openTransfer}>
              Geld übertragen
            </Button>
            <Button variant="outline" onClick={onArchive}>
              <Archive />
            </Button>
          </div>
        </div>
        <EditableDataTable
          columns={editableColumns}
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

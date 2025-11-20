import BudgetCard from "@/components/Dashboard/BudgetCard";
import DonorCSVExport from "@/components/Donors/DonorCSVExport";
import { PageHeader } from "@/components/Layout/PageHeader";
import { editableColumns } from "@/components/Tables/TransactionTable/editableColumns";
import { EditableDataTable } from "@/components/Tables/TransactionTable/EditableDataTable";
import { Doc } from "@/convex/_generated/dataModel";
import { PaginationStatus } from "convex/react";

interface DonorDetailUIProps {
  donor: Doc<"donors"> & {
    committedIncome: number;
    paidIncome: number;
    openIncome: number;
    totalExpenses: number;
  };
  transactions: Doc<"transactions">[];
  handleUpdate: (rowId: string, field: string, value: any) => Promise<void>;
  handleDelete: (rowId: string) => Promise<void>;
  status: PaginationStatus;
}
export default function DonorDetailUI({
  donor,
  transactions,
  handleUpdate,
  handleDelete,
  status,
}: DonorDetailUIProps) {
  return (
    <div>
      <PageHeader
        title={donor.name}
        subtitle={donor.type}
        showBackButton={true}
        backUrl="/donors"
      />

      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        id="tour-donor-budget"
      >
        <BudgetCard title="Zugesagt" amount={donor.committedIncome} />
        <BudgetCard title="Bezahlt" amount={donor.paidIncome} />
        <BudgetCard title="Offen" amount={donor.openIncome} />
        <BudgetCard title="Ausgaben" amount={-donor.totalExpenses} />
      </div>

      <div className="mt-6" id="tour-donor-transactions">
        <div className="flex flex-row justify-between">
          <h2 className="text-xl font-semibold mb-4">Transaktionen</h2>

          <DonorCSVExport donorId={donor._id} donorName={donor.name} />
        </div>
        <EditableDataTable
          columns={editableColumns}
          data={transactions}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          paginationStatus={status}
        />
      </div>
    </div>
  );
}

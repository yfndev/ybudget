import BudgetCard from "@/components/Dashboard/BudgetCard";
import { donorTypeLabels } from "@/components/Donors/DonorCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { editableColumnsWithoutProject } from "@/components/Tables/Transactions/EditableColumns";
import { EditableDataTable } from "@/components/Tables/Transactions/EditableDataTable";
import { Button } from "@/components/ui/button";
import { Doc } from "@/convex/_generated/dataModel";
import { PaginationStatus } from "convex/react";
import { CSVLink } from "react-csv";

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

const csvHeaders = [
  { label: "Datum", key: "date" },
  { label: "Betrag", key: "amount" },
  { label: "Beschreibung", key: "description" },
  { label: "Begünstigter/Zahlungspflichtiger", key: "counterparty" },
  { label: "Auftragskonto", key: "accountName" },
  { label: "Status", key: "status" },
];

export default function DonorDetailUI({
  donor,
  transactions,
  handleUpdate,
  handleDelete,
  status,
}: DonorDetailUIProps) {
  const csvData = transactions.map((t) => ({
    date: new Date(t.date).toISOString(),
    amount: t.amount,
    description: t.description,
    counterparty: t.counterparty,
    accountName: t.accountName ?? "",
    status: t.status,
  }));

  return (
    <div>
      <PageHeader
        title={donor.name}
        subtitle={donorTypeLabels[donor.type] ?? donor.type}
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
          <CSVLink
            data={csvData}
            filename={`${donor.name}-transactions.csv`}
            headers={csvHeaders}
          >
            <Button variant="outline" size="sm">
              Download CSV
            </Button>
          </CSVLink>
        </div>
        <EditableDataTable
          columns={editableColumnsWithoutProject}
          data={transactions}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          paginationStatus={status}
        />
      </div>
    </div>
  );
}

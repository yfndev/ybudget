import { PageHeader } from "@/components/Layout/PageHeader";
import { columns } from "@/components/Tables/columns";
import { EditableDataTable } from "@/components/Tables/EditableDataTable";
import { SidebarInset } from "@/components/ui/sidebar";
import { formatDate } from "@/lib/formatDate";
import type { PaginationStatus } from "convex/react";
import type { DateRange } from "react-day-picker";
import type { Doc } from "../../../convex/_generated/dataModel";

interface TransactionsPageUIProps {
  selectedDateRange: DateRange;
  transactions: Doc<"transactions">[];
  status: PaginationStatus;
  loadMore: () => void;
  onUpdateTransaction: (
    rowId: string,
    field: string,
    value: any,
  ) => Promise<void>;
}

export default function TransactionsOverviewUI({
  selectedDateRange,
  transactions,
  status,
  loadMore,
  onUpdateTransaction,
}: TransactionsPageUIProps) {
  const fromDate = formatDate(selectedDateRange.from);
  const toDate = formatDate(selectedDateRange.to);

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-5 pt-0 overflow-x-hidden w-full">
        <PageHeader title="Transaktionen" />
        <div className="text-sm text-muted-foreground">
          {fromDate} - {toDate}
        </div>
        <EditableDataTable
          columns={columns}
          data={transactions}
          onUpdate={onUpdateTransaction}
          paginationStatus={status}
          loadMore={loadMore}
        />
      </div>
    </SidebarInset>
  );
}

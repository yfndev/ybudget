"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { EditableDataTable } from "@/components/Tables/TransactionTable/EditableDataTable";
import { editableColumns } from "@/components/Tables/TransactionTable/editableColumns";
import { formatDate } from "@/lib/formatDate";
import type { EnrichedTransaction } from "@/lib/transactionFilters";
import type { PaginationStatus } from "convex/react";
import type { DateRange } from "react-day-picker";

interface TransactionsPageUIProps {
  selectedDateRange: DateRange;
  transactions: EnrichedTransaction[];
  status: PaginationStatus;
  loadMore: () => void;
  onUpdateTransaction: (
    rowId: string,
    field: string,
    value: any,
  ) => Promise<void>;
  onDeleteTransaction: (rowId: string) => Promise<void>;
}

export default function TransactionsOverviewUI({
  selectedDateRange,
  transactions,
  status,
  loadMore,
  onUpdateTransaction,
  onDeleteTransaction,
}: TransactionsPageUIProps) {
  const fromDate = formatDate(selectedDateRange.from);
  const toDate = formatDate(selectedDateRange.to);

  return (
    <div className="flex flex-col w-full h-screen">
      <PageHeader title="Transaktionen" />
      <div className="text-sm text-muted-foreground pb-4 ">
        {fromDate} - {toDate}
      </div>
      <div id="tour-transactions-table">
        <EditableDataTable
          columns={editableColumns}
          data={transactions}
          onUpdate={onUpdateTransaction}
          onDelete={onDeleteTransaction}
          paginationStatus={status}
          loadMore={loadMore}
        />
      </div>
    </div>
  );
}

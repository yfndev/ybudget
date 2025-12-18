"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { editableColumns } from "@/components/Tables/Transactions/EditableColumns";
import { EditableDataTable } from "@/components/Tables/Transactions/EditableDataTable";
import { formatDate } from "@/lib/formatters/formatDate";
import type { EnrichedTransaction } from "@/lib/transactionFilters";
import type { PaginationStatus } from "convex/react";
import type { DateRange } from "react-day-picker";

interface Props {
  selectedDateRange: DateRange | null;
  transactions: EnrichedTransaction[];
  status: PaginationStatus;
  loadMore: () => void;
  onUpdateTransaction: (
    rowId: string,
    field: string,
    value: unknown,
  ) => Promise<void>;
  onDeleteTransaction: (rowId: string) => Promise<void>;
}

export function TransactionsPageUI({
  selectedDateRange,
  transactions,
  status,
  loadMore,
  onUpdateTransaction,
  onDeleteTransaction,
}: Props) {
  const dateRangeText = selectedDateRange
    ? `${formatDate(selectedDateRange.from)} - ${formatDate(selectedDateRange.to)}`
    : "Alle Transaktionen";

  return (
    <div className="flex flex-col w-full h-screen">
      <PageHeader title="Transaktionen" showRangeCalendar />
      <div className="text-sm text-muted-foreground pb-4">{dateRangeText}</div>
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

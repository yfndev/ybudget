"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { EditableDataTable } from "@/components/Tables/EditableDataTable";
import { columns } from "@/components/Tables/columns";
import { SidebarInset } from "@/components/ui/sidebar";
import { useDateRange } from "@/contexts/DateRangeContext";
import { filterTransactionsByDateRange } from "@/lib/transactionFilters";
import { useMutation, usePaginatedQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export default function Transactions() {
  const { selectedDateRange } = useDateRange();
  const [allTransactions, setAllTransactions] = useState<any[]>([]);

  const updateTransaction = useMutation(
    api.transactions.functions.updateTransaction
  );

  const { results, status, loadMore } = usePaginatedQuery(
    api.transactions.queries.getPaginatedTransactions,
    {},
    { initialNumItems: 50 }
  );

  const transactions = useMemo(() => {
    const allData = results ?? [];
    setAllTransactions(allData);
    return filterTransactionsByDateRange(allData, selectedDateRange);
  }, [results, selectedDateRange]);

  const handleUpdateTransaction = async (
    rowId: string,
    field: string,
    value: any
  ) => {
    await updateTransaction({
      transactionId: rowId as Id<"transactions">,
      [field]: value,
    });
  };

  if (status === "LoadingFirstPage") {
    return (
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-5 pt-0 overflow-x-hidden w-full">
          <PageHeader title="Transaktionen" />
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-muted-foreground">
              Transaktionen werden geladen...
            </div>
          </div>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-5 pt-0 overflow-x-hidden w-full">
        <PageHeader title="Transaktionen" />
        <div className="text-sm text-muted-foreground">
          {selectedDateRange.from.toLocaleDateString("de-DE", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          })}{" "}
          -{" "}
          {selectedDateRange.to.toLocaleDateString("de-DE", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          })}
        </div>
        <EditableDataTable
          columns={columns}
          data={transactions || []}
          onUpdate={handleUpdateTransaction}
          hasNextPage={status === "CanLoadMore"}
          loadMore={() => loadMore(50)}
          isLoading={status === "LoadingMore"}
        />
      </div>
    </SidebarInset>
  );
}

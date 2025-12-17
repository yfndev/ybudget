"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useDateRange } from "@/lib/contexts/DateRangeContext";
import { useMutation, usePaginatedQuery } from "convex/react";
import { TransactionsPageUI } from "./TransactionsPageUI";

const TRANSACTIONS_PER_PAGE = 50;

export default function TransactionsPage() {
  const { selectedDateRange } = useDateRange();
  const updateTransaction = useMutation(
    api.transactions.functions.updateTransaction,
  );
  const deleteTransaction = useMutation(
    api.transactions.functions.deleteExpectedTransaction,
  );

  const { results, status, loadMore } = usePaginatedQuery(
    api.transactions.queries.getPaginatedTransactions,
    {
      startDate: selectedDateRange?.from?.getTime(),
      endDate: selectedDateRange?.to?.getTime(),
    },
    { initialNumItems: TRANSACTIONS_PER_PAGE },
  );

  return (
    <TransactionsOverviewUI
      selectedDateRange={selectedDateRange}
      transactions={results ?? []}
      status={status}
      loadMore={() => loadMore(TRANSACTIONS_PER_PAGE)}
      onUpdateTransaction={async (rowId, field, value) => {
        await updateTransaction({
          transactionId: rowId as Id<"transactions">,
          [field]: value,
        });
      }}
      onDeleteTransaction={async (rowId: string) => {
        await deleteTransaction({
          transactionId: rowId as Id<"transactions">,
        });
      }}
    />
  );
}

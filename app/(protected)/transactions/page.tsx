"use client";

import { useDateRange } from "@/contexts/DateRangeContext";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { filterTransactionsByDateRange } from "@/lib/transactionFilters";
import { usePaginatedQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";
import { useMemo } from "react";
import TransactionsOverviewUI from "./TransactionsOverviewUI";

const TRANSACTIONS_PER_PAGE = 50;

export default function Transactions() {
  const { selectedDateRange } = useDateRange();
  const updateTransaction = useMutation(
    api.transactions.functions.updateTransaction,
  );

  const { results, status, loadMore } = usePaginatedQuery(
    api.transactions.queries.getPaginatedTransactions,
    {},
    { initialNumItems: TRANSACTIONS_PER_PAGE },
  );

  const transactions = useMemo(() => {
    const allData = results ?? [];
    return filterTransactionsByDateRange(allData, selectedDateRange);
  }, [results, selectedDateRange]);

  return (
    <TransactionsOverviewUI
      selectedDateRange={selectedDateRange}
      transactions={transactions ?? []}
      status={status}
      loadMore={() => loadMore(TRANSACTIONS_PER_PAGE)}
      onUpdateTransaction={async (rowId, field, value) => {
        await updateTransaction({
          transactionId: rowId as Id<"transactions">,
          [field]: value,
        });
      }}
    />
  );
}

"use client";

import { useQuery } from "convex-helpers/react/cache";
import { useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";

type UseFetchImportTransactionsResult = {
  transactions: Array<Doc<"transactions">> | undefined;
  expectedTransactions: Array<Doc<"transactions">>;
  current: Doc<"transactions"> | null;
  index: number;
  totalCount: number;
  isLoading: boolean;
  setIndex: (v: number) => void;
};

export function useFetchImportTransactions(): UseFetchImportTransactionsResult {
  const [index, setIndex] = useState(0);

  const transactions = useQuery(
    api.transactions.queries.getUnassignedProcessedTransactions,
  );

  const current = useMemo(() => {
    if (!transactions || !transactions[index]) return null;
    return transactions[index];
  }, [transactions, index]);

  const expectedTransactions = useQuery(
    api.transactions.queries.getTransactionRecommendations,
    current
      ? {
          amount: current.amount,
          projectId: current.projectId || undefined,
        }
      : "skip",
  );

  return {
    transactions,
    expectedTransactions: expectedTransactions || [],
    current,
    index,
    totalCount: transactions?.length || 0,
    isLoading: transactions === undefined,
    setIndex,
  };
}

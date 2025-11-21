"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation, usePaginatedQuery } from "convex/react";
import { useParams } from "next/navigation";
import DonorIdUISkeleton from "./DonorDetailSkeleton";
import DonorIdUI from "./DonorDetailUI";

export default function DonorDetail() {
  const params = useParams();
  const donorId = params.donorId as Id<"donors">;

  const donor = useQuery(api.donors.queries.getDonorById, {
    donorId,
  });

  const {
    results: transactions,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.transactions.queries.getPaginatedTransactions,
    { donorId },
    { initialNumItems: 50 },
  );

  const updateTransaction = useMutation(
    api.transactions.functions.updateTransaction,
  );
  const deleteTransaction = useMutation(
    api.transactions.functions.deleteExpectedTransaction,
  );

  const handleUpdate = async (rowId: string, field: string, value: any) => {
    await updateTransaction({
      transactionId: rowId as Id<"transactions">,
      [field]: value,
    });
  };

  const handleDelete = async (rowId: string) => {
    await deleteTransaction({
      transactionId: rowId as Id<"transactions">,
    });
  };

  if (!donor || !transactions) {
    return <DonorIdUISkeleton />;
  }

  return (
    <DonorIdUI
      donor={donor}
      transactions={transactions}
      handleUpdate={handleUpdate}
      handleDelete={handleDelete}
      status={status}
    />
  );
}

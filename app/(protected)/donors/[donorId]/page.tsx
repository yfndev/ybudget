"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation, usePaginatedQuery } from "convex/react";
import { useParams } from "next/navigation";
import DonorIdUI from "./DonorDetailUI";
import DonorIdUISkeleton from "./DonorDetailSkeleton";

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
    { initialNumItems: 50 }
  );

  const updateTransaction = useMutation(
    api.transactions.functions.updateTransaction
  );

  const handleUpdate = async (rowId: string, field: string, value: any) => {
    await updateTransaction({
      transactionId: rowId as Id<"transactions">,
      [field]: value,
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
      status={status}
    />
  );
}

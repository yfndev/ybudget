"use client";

import { ImportTransactionCardUI } from "@/components/ImportTransactions/ImportTransactionCardUI";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { useMemo } from "react";

interface ImportTransactionCardProps {
  title: string;
  description?: string;
  amount: number;
  date: Date;
  currentIndex: number;
  totalCount: number;
  projectId: string;
  categoryId: string;
  donorId: string;
  selectedDonationIds: Id<"transactions">[];
  onProjectChange: (projectId: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onDonorChange: (donorId: string) => void;
  onDonationIdsChange: (donationIds: Id<"transactions">[]) => void;
}

export const ImportTransactionCard = ({
  title,
  description,
  amount,
  date,
  currentIndex,
  totalCount,
  projectId,
  categoryId,
  donorId,
  selectedDonationIds,
  onProjectChange,
  onCategoryChange,
  onDonorChange,
  onDonationIdsChange,
}: ImportTransactionCardProps) => {
  const isExpense = useMemo(() => amount < 0, [amount]);
  const isIncome = useMemo(() => amount > 0, [amount]);

  const availableDonations = useQuery(
    api.donations.queries.getAvailableDonationsForProject,
    isExpense && projectId ? { projectId } : "skip",
  );

  const hasDonations = useMemo(
    () => availableDonations !== undefined && availableDonations.length > 0,
    [availableDonations],
  );

  return (
    <ImportTransactionCardUI
      title={title}
      description={description}
      amount={amount}
      date={date}
      currentIndex={currentIndex}
      totalCount={totalCount}
      projectId={projectId}
      categoryId={categoryId}
      donorId={donorId}
      selectedDonationIds={selectedDonationIds}
      isExpense={isExpense}
      isIncome={isIncome}
      hasDonations={hasDonations}
      onProjectChange={onProjectChange}
      onCategoryChange={onCategoryChange}
      onDonorChange={onDonorChange}
      onDonationIdsChange={onDonationIdsChange}
    />
  );
};

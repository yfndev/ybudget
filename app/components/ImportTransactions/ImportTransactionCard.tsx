"use client";

import { ImportTransactionCardUI } from "@/components/ImportTransactions/ImportTransactionCardUI";
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
  onProjectChange: (projectId: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onDonorChange: (donorId: string) => void;
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
  onProjectChange,
  onCategoryChange,
  onDonorChange,
}: ImportTransactionCardProps) => {
  const isExpense = useMemo(() => amount < 0, [amount]);
  const isIncome = useMemo(() => amount > 0, [amount]);

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
      isExpense={isExpense}
      isIncome={isIncome}
      onProjectChange={onProjectChange}
      onCategoryChange={onCategoryChange}
      onDonorChange={onDonorChange}
    />
  );
};

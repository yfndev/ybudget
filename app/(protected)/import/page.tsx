"use client";

import ImportTransactionsPageUI from "@/(protected)/import/ImportTransactionsPageUI";
import { ImportTransactionsSkeleton } from "@/(protected)/import/ImportTransactionsSkeleton";
import { useFetchImportTransactions } from "@/hooks/ImportTransactions/useFetchImportTransactions";
import { useImportForm } from "@/hooks/ImportTransactions/useImportForm";
import { useImportKeyboard } from "@/hooks/ImportTransactions/useImportKeyboard";
import { useImportSave } from "@/hooks/ImportTransactions/useImportSave";
import { useCallback, useEffect } from "react";

export default function ImportTransactionsPage() {
  const {
    transactions,
    expectedTransactions,
    current,
    index,
    totalCount,
    isLoading,
    setIndex,
  } = useFetchImportTransactions();

  const form = useImportForm();
  const { save } = useImportSave();

  const { initFromTransaction, clearForm } = form;

  useEffect(() => {
    initFromTransaction(current);
  }, [current, initFromTransaction]);

  const handleNext = useCallback(() => {
    if (!transactions || index >= transactions.length - 1) return;
    setIndex(index + 1);
    clearForm();
  }, [transactions, index, setIndex, clearForm]);

  const handlePrev = useCallback(() => {
    if (index === 0) return;
    setIndex(index - 1);
    clearForm();
  }, [index, setIndex, clearForm]);

  const handleSave = useCallback(async () => {
    if (!transactions || !transactions[index]) return;
    const success = await save(transactions[index], {
      projectId: form.projectId,
      categoryId: form.categoryId,
      donorId: form.donorId,
      matchedTransactionId: form.matchedTransactionId,
    });
    if (success) {
      handleNext();
    }
  }, [
    transactions,
    index,
    form.projectId,
    form.categoryId,
    form.donorId,
    form.matchedTransactionId,
    save,
    handleNext,
  ]);

  const handleExpectedTransactionSelect = useCallback(
    (expectedTransactionId: string) => {
      form.setMatchedTransactionId(expectedTransactionId);
      const expected = expectedTransactions.find(
        (t) => t._id === expectedTransactionId,
      );
      if (expected) {
        if (expected.projectId) form.setProjectId(expected.projectId);
        if (expected.categoryId) form.setCategoryId(expected.categoryId);
      }
    },
    [expectedTransactions, form],
  );

  useImportKeyboard(handleNext, handlePrev, handleSave);

  if (isLoading) {
    return <ImportTransactionsSkeleton />;
  }

  return (
    <ImportTransactionsPageUI
      expectedTransactions={expectedTransactions}
      current={current}
      index={index}
      totalCount={totalCount}
      form={form}
      onExpectedTransactionSelect={handleExpectedTransactionSelect}
    />
  );
}

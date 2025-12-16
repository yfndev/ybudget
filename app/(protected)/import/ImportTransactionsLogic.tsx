"use client";

import { ImportTransactionsSkeleton } from "@/(protected)/import/ImportTransactionsSkeleton";
import { ImportTransactionsUI } from "@/(protected)/import/ImportTransactionsUI";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const ImportTransactionsLogic = () => {
  const [index, setIndex] = useState(0);
  const [projectId, setProjectId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [donorId, setDonorId] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [splitIncome, setSplitIncome] = useState(false);
  const [budgets, setBudgets] = useState<
    Array<{ projectId: string; amount: number }>
  >([]);

  const transactions = useQuery(
    api.transactions.queries.getUnassignedProcessedTransactions,
  );

  const updateTransaction = useMutation(
    api.transactions.functions.updateTransaction,
  );
  const splitTransaction = useMutation(
    api.transactions.functions.splitTransaction,
  );

  const current = transactions?.[index] || null;

  const expectedTransactions = (useQuery(
    api.transactions.queries.getMatchingRecommendations,
    current
      ? { projectId: projectId ? (projectId as Id<"projects">) : undefined }
      : "skip",
  ) || []) as Doc<"transactions">[];

  useEffect(() => {
    if (!current) {
      setProjectId("");
      setCategoryId("");
      setDonorId("");
      setSelectedMatch(null);
      setSplitIncome(false);
      setBudgets([]);
      return;
    }
    setProjectId(current.projectId || "");
    setCategoryId(current.categoryId || "");
    setDonorId(current.donorId || "");
    setSelectedMatch(current.matchedTransactionId || null);
    setSplitIncome(false);
    setBudgets([]);
  }, [current?._id]);

  const handleNext = useCallback(() => {
    if (!transactions || index >= transactions.length - 1) return;
    setIndex(index + 1);
  }, [transactions, index]);

  const handlePrev = useCallback(() => {
    if (index === 0) return;
    setIndex(index - 1);
  }, [index]);

  const handleSave = useCallback(async () => {
    if (!current) return;

    if (!categoryId || (!splitIncome && !projectId)) {
      toast("Transaktion übersprungen", { icon: "⏭️" });
      handleNext();
      return;
    }

    const baseUpdate = {
      transactionId: current._id,
      categoryId: categoryId as Id<"categories">,
      donorId: donorId ? (donorId as Id<"donors">) : undefined,
      matchedTransactionId: selectedMatch
        ? (selectedMatch as Id<"transactions">)
        : undefined,
    };

    try {
      if (splitIncome && budgets.length > 0) {
        await updateTransaction(baseUpdate);
        await splitTransaction({
          transactionId: current._id,
          splits: budgets.map((b) => ({
            projectId: b.projectId as Id<"projects">,
            amount: b.amount,
          })),
        });
      } else {
        await updateTransaction({
          ...baseUpdate,
          projectId: projectId as Id<"projects">,
        });
      }

      if (selectedMatch) {
        await updateTransaction({
          transactionId: selectedMatch as Id<"transactions">,
          matchedTransactionId: current._id,
        });
      }

      toast.success("Transaktion gespeichert");
      handleNext();
    } catch {
      toast.error("Fehler beim Speichern");
    }
  }, [
    current,
    categoryId,
    splitIncome,
    projectId,
    budgets,
    donorId,
    selectedMatch,
    updateTransaction,
    splitTransaction,
    handleNext,
  ]);

  const handleExpectedTransactionSelect = (expectedTransactionId: string) => {
    setSelectedMatch(expectedTransactionId);
    const expected = expectedTransactions.find(
      (transaction) => transaction._id === expectedTransactionId,
    );
    if (expected) {
      if (expected.projectId) setProjectId(expected.projectId);
      if (expected.categoryId) setCategoryId(expected.categoryId);
    }
  };

  const handleSplitIncomeChange = (newSplitIncome: boolean) => {
    setSplitIncome(newSplitIncome);
    if (!newSplitIncome) setBudgets([]);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleNext();
      }
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNext, handleSave, handlePrev]);

  if (!transactions) {
    return <ImportTransactionsSkeleton />;
  }

  return (
    <ImportTransactionsUI
      current={current}
      index={index}
      totalCount={transactions.length}
      projectId={projectId}
      categoryId={categoryId}
      donorId={donorId}
      selectedMatch={selectedMatch}
      splitIncome={splitIncome}
      expectedTransactions={expectedTransactions}
      setProjectId={setProjectId}
      setCategoryId={setCategoryId}
      setDonorId={setDonorId}
      handleExpectedTransactionSelect={handleExpectedTransactionSelect}
      onSplitIncomeChange={handleSplitIncomeChange}
      onBudgetsChange={setBudgets}
    />
  );
};

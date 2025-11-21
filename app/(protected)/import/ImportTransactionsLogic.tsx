"use client";

import { ImportTransactionsSkeleton } from "@/(protected)/import/ImportTransactionsSkeleton";
import { ImportTransactionsUI } from "@/(protected)/import/ImportTransactionsUI";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export const ImportTransactionsLogic = () => {
  const [index, setIndex] = useState(0);
  const [projectId, setProjectId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [donorId, setDonorId] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [splitIncome, setSplitIncome] = useState(false);
  const [budgetAllocations, setBudgetAllocations] = useState<
    Array<{ projectId: string; amount: number }>
  >([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  const expectedTransactions =
    useQuery(
      api.transactions.queries.getTransactionRecommendations,
      current
        ? {
            amount: current.amount,
            projectId: projectId ? (projectId as Id<"projects">) : undefined,
          }
        : "skip",
    ) || [];

  useEffect(() => {
    if (!current) {
      setProjectId("");
      setCategoryId("");
      setDonorId("");
      setSelectedMatch(null);
      setSplitIncome(false);
      setBudgetAllocations([]);
      return;
    }
    setProjectId(current.projectId || "");
    setCategoryId(current.categoryId || "");
    setDonorId(current.donorId || "");
    setSelectedMatch(current.matchedTransactionId || null);
    setSplitIncome(false);
    setBudgetAllocations([]);
  }, [current]);

  useEffect(() => {
    if (!transactions) return;
    if (index >= transactions.length) setIndex(0);
  }, [transactions, index]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setSelectedMatch(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNext = () => {
    if (!transactions || index >= transactions.length - 1) return;
    setIndex(index + 1);
  };

  const handlePrev = () => {
    if (index === 0) return;
    setIndex(index - 1);
  };

  const handleSave = async () => {
    if (!current) return;

    if (!categoryId || (!splitIncome && !projectId)) {
      toast("Transaktion übersprungen", { icon: "⏭️" });
      handleNext();
      return;
    }

    try {
      if (splitIncome && budgetAllocations.length > 0) {
        await updateTransaction({
          transactionId: current._id,
          categoryId: categoryId as Id<"categories">,
          donorId: donorId ? (donorId as Id<"donors">) : undefined,
          matchedTransactionId: selectedMatch
            ? (selectedMatch as Id<"transactions">)
            : undefined,
        });

        await splitTransaction({
          transactionId: current._id,
          splits: budgetAllocations.map((a) => ({
            projectId: a.projectId as Id<"projects">,
            amount: a.amount,
          })),
        });
      } else {
        await updateTransaction({
          transactionId: current._id,
          projectId: projectId as Id<"projects">,
          categoryId: categoryId as Id<"categories">,
          donorId: donorId ? (donorId as Id<"donors">) : undefined,
          matchedTransactionId: selectedMatch
            ? (selectedMatch as Id<"transactions">)
            : undefined,
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Fehler beim Speichern";
      toast.error(errorMessage);
    }
  };

  const handleExpectedTransactionSelect = (expectedTransactionId: string) => {
    setSelectedMatch(expectedTransactionId);
    const expected = expectedTransactions.find(
      (t) => t._id === expectedTransactionId,
    );
    if (expected) {
      if (expected.projectId) setProjectId(expected.projectId);
      if (expected.categoryId) setCategoryId(expected.categoryId);
    }
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
  });

  const handleSplitIncomeChange = (newSplitIncome: boolean) => {
    setSplitIncome(newSplitIncome);
    if (!newSplitIncome) setBudgetAllocations([]);
  };

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
      containerRef={containerRef}
      setProjectId={setProjectId}
      setCategoryId={setCategoryId}
      setDonorId={setDonorId}
      handleExpectedTransactionSelect={handleExpectedTransactionSelect}
      onSplitIncomeChange={handleSplitIncomeChange}
      onBudgetAllocationsChange={setBudgetAllocations}
    />
  );
};

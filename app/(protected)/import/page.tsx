"use client";

import { ImportTransactionsSkeleton } from "@/(protected)/import/ImportTransactionsSkeleton";
import { ExpectedTransactionMatchesUI } from "@/components/ImportTransactions/ExpectedTransactionMatchesUI";
import { ImportTransactionCard } from "@/components/ImportTransactions/ImportTransactionCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function ImportTransactionsPage() {
  const [index, setIndex] = useState(0);
  const [projectId, setProjectId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [donorId, setDonorId] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [selectedDonationIds, setSelectedDonationIds] = useState<
    Id<"transactions">[]
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const transactions = useQuery(
    api.transactions.queries.getUnassignedProcessedTransactions
  );

  const updateTransaction = useMutation(
    api.transactions.functions.updateTransaction
  );

  const current = useMemo(() => {
    if (!transactions || transactions.length === 0) return null;
    return transactions[index] || null;
  }, [transactions, index]);

  const expectedTransactions =
    useQuery(
      api.transactions.queries.getTransactionRecommendations,
      current
        ? {
            amount: current.amount,
            projectId: projectId ? (projectId as Id<"projects">) : undefined,
          }
        : "skip"
    ) || [];

  useEffect(() => {
    if (!current) {
      setProjectId("");
      setCategoryId("");
      setDonorId("");
      setSelectedMatch(null);
      setSelectedDonationIds([]);
      return;
    }
    setProjectId(current.projectId || "");
    setCategoryId(current.categoryId || "");
    setDonorId(current.donorId || "");
    setSelectedMatch(current.matchedTransactionId || null);
    setSelectedDonationIds([]);
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

    if (!projectId || !categoryId) {
      toast("Transaktion übersprungen", { icon: "⏭️" });
      handleNext();
      return;
    }

    try {
      await updateTransaction({
        transactionId: current._id,
        projectId: projectId as Id<"projects">,
        categoryId: categoryId as Id<"categories">,
        donorId: donorId ? (donorId as Id<"donors">) : undefined,
        matchedTransactionId: selectedMatch
          ? (selectedMatch as Id<"transactions">)
          : undefined,
      });

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
  };

  const handleExpectedTransactionSelect = (expectedTransactionId: string) => {
    setSelectedMatch(expectedTransactionId);
    const expected = expectedTransactions.find(
      (t) => t._id === expectedTransactionId
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

  if (!transactions) {
    return <ImportTransactionsSkeleton />;
  }

  const totalCount = transactions.length;

  return (
    <div id="tour-import-page">
      <PageHeader title="Transaktionen zuordnen" />

      {totalCount === 0 ? (
        <div className="flex items-center justify-center">
          <p className="text-lg text-muted-foreground">
            Es gibt keine Transaktionen zum Zuordnen
          </p>
        </div>
      ) : (
        <>
          <div className="flex mt-8 justify-center" id="tour-import-progress">
            <Progress
              className="w-3/4"
              value={((index + 1) / totalCount) * 100}
            />
          </div>
          <div className="flex mt-24 gap-16 h-full">
            <div id="tour-expected-matches">
              <ExpectedTransactionMatchesUI
                expectedTransactions={expectedTransactions}
                selectedMatch={selectedMatch}
                containerRef={containerRef}
                onSelect={handleExpectedTransactionSelect}
              />
            </div>
            <div id="tour-import-card">
              {current && (
                <ImportTransactionCard
                  title={current.counterparty || ""}
                  description={current.description}
                  amount={current.amount}
                  date={new Date(current.date)}
                  currentIndex={index + 1}
                  totalCount={totalCount}
                  projectId={projectId}
                  categoryId={categoryId}
                  donorId={donorId}
                  selectedDonationIds={selectedDonationIds}
                  onProjectChange={setProjectId}
                  onCategoryChange={setCategoryId}
                  onDonorChange={setDonorId}
                  onDonationIdsChange={setSelectedDonationIds}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

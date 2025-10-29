"use client";

import { ExpectedTransactionMatches } from "@/components/ImportTransaction/ExpectedTransactionMatches";
import { ImportCSVCard } from "@/components/ImportTransaction/ImportCSVCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Progress } from "@/components/ui/progress";
import { SidebarInset } from "@/components/ui/sidebar";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../../convex/_generated/api";

export default function ImportTransactionsPage() {
  const [index, setIndex] = useState(0);
  const [projectId, setProjectId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [matchedTransactionId, setMatchedTransactionId] = useState<
    string | null
  >(null);

  const transactions = useQuery(
    api.queries.transactionQueries.getUnassignedProcessedTransactions
  );

  const currentTransaction = transactions?.[index];
  const expectedTransactions = useQuery(
    api.queries.transactionQueries.getTransactionRecommendations,
    currentTransaction
      ? {
          amount: currentTransaction.amount,
          projectId: currentTransaction.projectId || undefined,
        }
      : "skip"
  );
  const updateTransaction = useMutation(
    api.functions.transactionMutations.updateProcessedTransaction
  );

  const clearForm = () => {
    setProjectId("");
    setCategoryId("");
    setMatchedTransactionId(null);
  };

  const handleExpectedTransactionSelect = (expectedTransactionId: string) => {
    setMatchedTransactionId(expectedTransactionId);
    const expected = expectedTransactions?.find(
      (t) => t._id === expectedTransactionId
    );
    if (expected) {
      if (expected.projectId) setProjectId(expected.projectId);
      if (expected.categoryId) setCategoryId(expected.categoryId);
    }
  };

  const goToNext = () => {
    if (!transactions || index >= transactions.length - 1) return;
    setIndex(index + 1);
    clearForm();
  };

  const goToPrevious = () => {
    if (index === 0) return;
    setIndex(index - 1);
    clearForm();
  };

  useEffect(() => {
    if (!transactions || !transactions[index]) {
      clearForm();
      return;
    }

    const current = transactions[index];
    setProjectId(current.projectId || "");
    setCategoryId(current.categoryId || "");
    setMatchedTransactionId(current.matchedTransactionId || null);
  }, [index, transactions]);

  const saveCurrent = async () => {
    if (!transactions || !transactions[index]) return;

    if (!projectId || !categoryId) {
      toast("Transaktion übersprungen", { icon: "⏭️" });
      goToNext();
      return;
    }

    try {
      await updateTransaction({
        transactionId: transactions[index]._id,
        projectId,
        categoryId,
        matchedTransactionId:
          matchedTransactionId && matchedTransactionId !== ""
            ? matchedTransactionId
            : undefined,
      });
      toast.success("Transaktion gespeichert");
      goToNext();
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        goToNext();
      }
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        saveCurrent();
      }
      if (e.key === "ArrowLeft" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        goToPrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    index,
    projectId,
    categoryId,
    matchedTransactionId,
    transactions,
    expectedTransactions,
    updateTransaction,
  ]);

  if (!transactions) {
    return (
      <SidebarInset>
        <div className="px-4 lg:px-6 pb-6 flex flex-col h-full"></div>
        <PageHeader title="Transaktionen zuordnen" />
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-muted-foreground">Laden...</div>
        </div>
      </SidebarInset>
    );
  }

  if (transactions.length === 0) {
    return (
      <SidebarInset>
        <div className="px-4 lg:px-6 pb-6 flex flex-col h-full">
          <PageHeader title="Transaktionen zuordnen" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">
                Keine unzugeordneten Transaktionen
              </h3>
              <p className="text-sm text-muted-foreground">
                Alle Transaktionen sind bereits zugeordnet.
              </p>
            </div>
          </div>
        </div>
      </SidebarInset>
    );
  }

  const current = transactions[index];

  return (
    <SidebarInset>
      <div className="px-4 lg:px-6 pb-6 flex flex-col h-full">
        <PageHeader title="Transaktionen zuordnen" />
        <div className="flex-1 flex mt-16 gap-16 ">
          <ExpectedTransactionMatches
            expectedTransactions={expectedTransactions || []}
            onSelect={handleExpectedTransactionSelect}
          />
          <div className="mt-16 flex-shrink-0">
            <ImportCSVCard
              title={current.counterparty || ""}
              description={current.description}
              amount={current.amount}
              date={new Date(current.date)}
              currentIndex={index + 1}
              totalCount={transactions.length}
              projectId={projectId}
              categoryId={categoryId}
              onProjectChange={setProjectId}
              onCategoryChange={setCategoryId}
            />
          </div>
        </div>
        <div className="mt-auto pt-6">
          <Progress
            className="w-3/4 mx-auto"
            value={(index / transactions.length) * 100}
          />
        </div>
      </div>
    </SidebarInset>
  );
}

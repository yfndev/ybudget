"use client";

import { ExpectedTransactionMatches } from "@/components/ImportTransaction/ExpectedTransactionMatches";
import { ImportCSVCard } from "@/components/ImportTransaction/ImportCSVCard";
import { ImportTransactionsSkeleton } from "@/components/ImportTransaction/ImportTransactionsSkeleton";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Progress } from "@/components/ui/progress";
import { SidebarInset } from "@/components/ui/sidebar";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export default function ImportTransactionsPage() {
  const [index, setIndex] = useState(0);
  const [projectId, setProjectId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [donorId, setDonorId] = useState("");
  const [matchedTransactionId, setMatchedTransactionId] = useState<
    string | null
  >(null);
  const [selectedDonationIds, setSelectedDonationIds] = useState<
    Id<"transactions">[]
  >([]);

  const transactions = useQuery(
    api.transactions.queries.getUnassignedProcessedTransactions
  );

  const currentTransaction = transactions?.[index];
  const expectedTransactions = useQuery(
    api.transactions.queries.getTransactionRecommendations,
    currentTransaction
      ? {
          amount: currentTransaction.amount,
          projectId: currentTransaction.projectId || undefined,
        }
      : "skip"
  );
  const updateTransaction = useMutation(
    api.transactions.functions.updateTransaction
  );
  const createDonationLink = useMutation(
    api.donors.functions.createDonationExpenseLink
  );

  const clearForm = () => {
    setProjectId("");
    setCategoryId("");
    setDonorId("");
    setMatchedTransactionId(null);
    setSelectedDonationIds([]);
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
    setDonorId(current.donorId || "");
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
      const transactionId = transactions[index]._id;
      const isIncome = transactions[index].amount > 0;
      await updateTransaction({
        transactionId,
        projectId,
        categoryId,
        ...(isIncome && donorId ? { donorId } : {}),
        matchedTransactionId:
          matchedTransactionId && matchedTransactionId !== ""
            ? matchedTransactionId
            : undefined,
      });

      // If this transaction is matched with an expected transaction, update the expected transaction too
      if (matchedTransactionId && matchedTransactionId !== "") {
        await updateTransaction({
          transactionId: matchedTransactionId as Id<"transactions">,
          matchedTransactionId: transactionId,
        });
      }

      const isExpense = transactions[index].amount < 0;
      if (isExpense && selectedDonationIds.length > 0) {
        for (const donationId of selectedDonationIds) {
          try {
            await createDonationLink({
              expenseId: transactionId,
              donationId: donationId,
            });
          } catch (error: any) {
            toast.error(
              `Fehler bei Zuordnung: ${error.message || "Unbekannter Fehler"}`
            );
          }
        }
      }

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
  }, [index, transactions, saveCurrent]);

  const current = transactions?.[index];
  const isLoading = transactions === undefined;

  if (isLoading) {
    return <ImportTransactionsSkeleton />;
  }

  return (
    <SidebarInset>
      <div className="p-4 lg:px-6 pb-6 flex flex-col h-full">
        <PageHeader title="Transaktionen zuordnen" />
        <div className="flex-1 flex mt-16 gap-16 ">
          <ExpectedTransactionMatches
            expectedTransactions={expectedTransactions || []}
            onSelect={handleExpectedTransactionSelect}
          />
          <div className="mt-16 flex-shrink-0">
            <ImportCSVCard
              title={current?.counterparty || ""}
              description={current?.description || ""}
              amount={current?.amount || 0}
              date={new Date(current?.date || 0)}
              currentIndex={index + 1}
              totalCount={transactions?.length || 0}
              projectId={projectId}
              categoryId={categoryId}
              donorId={donorId}
              selectedDonationIds={selectedDonationIds}
              onProjectChange={setProjectId}
              onCategoryChange={setCategoryId}
              onDonorChange={setDonorId}
              onDonationIdsChange={setSelectedDonationIds}
            />
          </div>
        </div>
        <div className="mt-auto pt-6">
          <Progress
            className="w-3/4 mx-auto"
            value={(index / (transactions?.length || 0)) * 100}
          />
        </div>
      </div>
    </SidebarInset>
  );
}

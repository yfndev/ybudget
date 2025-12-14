"use client";

import ProjectDashboardSkeleton from "@/(protected)/projects/[projectId]/ProjectDashboardSkeleton";
import ProjectDashboardUI from "@/(protected)/projects/[projectId]/ProjectDashboardUI";
import TransferDialog from "@/components/Dialogs/TransferDialog";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { calculateBudget } from "@/lib/calculations/budgetCalculations";
import { filterTransactionsByDateRange } from "@/lib/calculations/transactionFilters";
import { useDateRange } from "@/lib/contexts/DateRangeContext";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function ProjectDetail() {
  const projectId = useParams().projectId as string;
  const { selectedDateRange } = useDateRange();
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const project = useQuery(api.projects.queries.getProjectById, {
    projectId: projectId as Id<"projects">,
  });

  const {
    results: allTransactions,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.transactions.queries.getPaginatedTransactions,
    { projectId: projectId as Id<"projects"> },
    { initialNumItems: 50 },
  );

  const filteredTransactions = useMemo(
    () => filterTransactionsByDateRange(allTransactions, selectedDateRange),
    [allTransactions, selectedDateRange],
  );

  const budgets = useMemo(
    () => calculateBudget(allTransactions ?? []),
    [allTransactions],
  );

  const updateTransaction = useMutation(
    api.transactions.functions.updateTransaction,
  );
  const deleteTransaction = useMutation(
    api.transactions.functions.deleteExpectedTransaction,
  );

  const archiveProject = useMutation(api.projects.functions.archiveProject);

  const handleUpdateTransaction = async (
    transactionId: string,
    field: string,
    value: any,
  ) => {
    try {
      await updateTransaction({
        transactionId: transactionId as Id<"transactions">,
        [field]: value,
      });

      toast.success("Transaktion aktualisiert");
    } catch (error) {
      toast.error("Fehler beim Aktualisieren");
      throw error;
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransaction({
        transactionId: transactionId as Id<"transactions">,
      });
    } catch (error) {
      throw error;
    }
  };

  const handleOpenTransfer = () => {
    setIsTransferOpen(true);
  };

  if (!project) {
    return <ProjectDashboardSkeleton />;
  }

  return (
    <>
      <ProjectDashboardUI
        project={project}
        transactions={filteredTransactions ?? []}
        budgets={budgets}
        status={status}
        loadMore={loadMore}
        onUpdate={handleUpdateTransaction}
        onDelete={handleDeleteTransaction}
        openTransfer={handleOpenTransfer}
      />
      <TransferDialog open={isTransferOpen} onOpenChange={setIsTransferOpen} />
    </>
  );
}

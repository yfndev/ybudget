"use client";

import { ProjectDashboardSkeleton } from "@/(protected)/projects/[projectId]/ProjectDashboardSkeleton";
import { ProjectDashboardUI } from "@/(protected)/projects/[projectId]/ProjectDashboardUI";
import { TransferDialog } from "@/components/Dialogs/TransferDialog";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { calculateBudget } from "@/lib/calculations/budgetCalculations";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: Id<"projects"> }>();
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const project = useQuery(api.projects.queries.getProjectById, { projectId });
  const {
    results: transactions,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.transactions.queries.getPaginatedTransactions,
    { projectId },
    { initialNumItems: 50 }
  );

  const budgets = useMemo(
    () => calculateBudget(transactions ?? []),
    [transactions]
  );

  const updateTransaction = useMutation(
    api.transactions.functions.updateTransaction
  );
  const deleteTransaction = useMutation(
    api.transactions.functions.deleteExpectedTransaction
  );

  const handleUpdate = async (id: string, field: string, value: unknown) => {
    try {
      await updateTransaction({
        transactionId: id as Id<"transactions">,
        [field]: value,
      });
      toast.success("Transaktion aktualisiert");
    } catch {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction({ transactionId: id as Id<"transactions"> });
  };

  if (!project) return <ProjectDashboardSkeleton />;

  return (
    <>
      <ProjectDashboardUI
        project={project}
        transactions={transactions ?? []}
        budgets={budgets}
        status={status}
        loadMore={loadMore}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onOpenTransfer={() => setIsTransferOpen(true)}
      />
      <TransferDialog open={isTransferOpen} onOpenChange={setIsTransferOpen} />
    </>
  );
}

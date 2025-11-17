"use client";

import ProjectDashboardSkeleton from "@/(protected)/projects/[projectId]/ProjectDashboardSkeleton";
import ProjectDashboardUI from "@/(protected)/projects/[projectId]/ProjectDashboardUI";
import { useDateRange } from "@/contexts/DateRangeContext";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { calculateBudget } from "@/lib/budgetCalculations";
import { filterTransactionsByDateRange } from "@/lib/transactionFilters";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation, usePaginatedQuery } from "convex/react";
import { useParams } from "next/navigation";
import posthog from "posthog-js";
import { useMemo } from "react";
import toast from "react-hot-toast";

export default function ProjectDetail() {
  const projectId = useParams().projectId as string;
  const { selectedDateRange } = useDateRange();

  const project = useQuery(api.projects.queries.getProjectById, {
    projectId,
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

      posthog.capture("transaction_updated", {
        field_updated: field,
        project_id: projectId,
        timestamp: new Date().toISOString(),
      });

      toast.success("Transaktion aktualisiert");
    } catch (error) {
      posthog.captureException(error as Error);
      toast.error("Fehler beim Aktualisieren");
      throw error;
    }
  };

  if (!project) {
    return <ProjectDashboardSkeleton />;
  }

  return (
    <ProjectDashboardUI
      project={project}
      transactions={filteredTransactions ?? []}
      budgets={budgets}
      status={status}
      loadMore={loadMore}
      onUpdate={handleUpdateTransaction}
    />
  );
}

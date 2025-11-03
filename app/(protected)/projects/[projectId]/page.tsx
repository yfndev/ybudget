"use client";

import BudgetCard from "@/components/Dashboard/BudgetCard";
import ProjectCard from "@/components/Dashboard/ProjectCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { EditableDataTable } from "@/components/Tables/EditableDataTable";
import { editableColumns } from "@/components/Tables/editableColumns";
import { SidebarInset } from "@/components/ui/sidebar";
import { useDateRange } from "@/contexts/DateRangeContext";
import { calculateBudget } from "@/lib/budgetCalculations";
import { filterTransactionsByDateRange } from "@/lib/transactionFilters";
import { useMutation, useQuery, usePaginatedQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { selectedDateRange } = useDateRange();

  const project = useQuery(api.projects.queries.getProjectById, {
    projectId,
  });

  const children = useQuery(api.projects.queries.getChildProjects, {
    parentId: projectId,
  });

  const { results: allTransactions, status, loadMore } = usePaginatedQuery(
    api.transactions.queries.getPaginatedTransactions,
    { projectId: projectId as Id<"projects"> },
    { initialNumItems: 50 }
  );

  const transactions = useMemo(
    () => filterTransactionsByDateRange(allTransactions, selectedDateRange),
    [allTransactions, selectedDateRange],
  );

  const budgets = useMemo(
    () => calculateBudget(transactions ?? []),
    [transactions],
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
      toast.success("Transaktion aktualisiert");
    } catch (error) {
      toast.error("Fehler beim Aktualisieren");
      throw error;
    }
  };

  if (!project) {
    return (
      <SidebarInset>
        <div className="p-6">
          <p>Projekt nicht gefunden</p>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <div className="p-4 lg:px-6 pb-6 overflow-x-hidden w-full">
        <PageHeader title={project.name} />

        <div className="grid grid-cols-2 py-5 lg:grid-cols-4 gap-4 lg:gap-6">
          <BudgetCard
            title={"Kontostand"}
            amount={budgets.currentBalance}
            description="Verfügbarer Betrag auf dem Konto"
          />
          <BudgetCard
            title={"Kommt noch rein"}
            amount={budgets.expectedIncome}
            description="Zugesagtes Geld das noch nicht überwiesen wurde"
          />
          <BudgetCard
            title={"Muss noch bezahlt werden"}
            amount={budgets.expectedExpenses}
            description="Rechnungen und Zusagen die noch von uns bezahlt werden müssen"
          />
          <BudgetCard
            title={"Kann ausgegeben werden"}
            amount={budgets.availableBudget}
            description="Auf dem Konto + kommt rein - muss bezahlt werden"
          />
        </div>

        {children && children.length > 0 && (
          <div className="flex flex-col lg:flex-row h-auto lg:h-[400px] w-full gap-4 lg:gap-6 mt-4 lg:mt-6">
            <div className="flex-1 flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Projekte</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 flex-1">
                {children.map((child) => (
                  <ProjectCard
                    key={child._id}
                    title={child.name}
                    description={child.description}
                    progress={20}
                    projectId={child._id}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 lg:mt-6">
          <h2 className="text-xl font-semibold mb-4">Transaktionen</h2>
          <EditableDataTable
            columns={editableColumns}
            data={transactions || []}
            onUpdate={handleUpdateTransaction}
            hasNextPage={status === "CanLoadMore"}
            loadMore={loadMore}
            isLoading={status === "LoadingMore"}
          />
        </div>
      </div>
    </SidebarInset>
  );
}

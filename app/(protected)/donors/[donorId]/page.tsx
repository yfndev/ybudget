"use client";

import BudgetCard from "@/components/Dashboard/BudgetCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { EditableDataTable } from "@/components/Tables/EditableDataTable";
import { columns } from "@/components/Tables/columns";
import { SidebarInset } from "@/components/ui/sidebar";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation, usePaginatedQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function DonorDetail() {
  const params = useParams();
  const donorId = params.donorId as string;

  const donor = useQuery(api.donors.queries.getDonorSummary, { donorId });

  const {
    results: transactions,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.transactions.queries.getPaginatedTransactions,
    { donorId },
    { initialNumItems: 50 },
  );

  const updateTransaction = useMutation(
    api.transactions.functions.updateTransaction,
  );

  const handleUpdate = async (rowId: string, field: string, value: any) => {
    await updateTransaction({
      transactionId: rowId as Id<"transactions">,
      [field]: value,
    });
  };

  if (!donor || !transactions) {
    return (
      <SidebarInset>
        <div className="p-6">
          <p>Lade Förderer...</p>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <div className="p-4 lg:px-6 pb-6 overflow-x-hidden w-full">
        <PageHeader
          title={donor.donor.name}
          subtitle={donor.donor.type}
          showBackButton={true}
          backUrl="/donors"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <BudgetCard title="Zugesagt" amount={donor.committedIncome} />
          <BudgetCard title="Bezahlt" amount={donor.paidIncome} />
          <BudgetCard title="Offen" amount={donor.openIncome} />
          <BudgetCard title="Ausgaben" amount={-donor.totalExpenses} />
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Transaktionen</h2>
          <EditableDataTable
            columns={columns}
            data={transactions}
            onUpdate={handleUpdate}
            paginationStatus={status}
          />
        </div>
      </div>
    </SidebarInset>
  );
}

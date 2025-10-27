"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { DataTable } from "@/components/Tables/DataTable";
import { columns } from "@/components/Tables/columns";
import { SidebarInset } from "@/components/ui/sidebar";
import { useDateRange } from "@/contexts/DateRangeContext";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function Transactions() {
  const { selectedDateRange } = useDateRange();

  const startDate = selectedDateRange.from?.getTime() ?? 0;
  const endDate = selectedDateRange.to?.getTime() ?? Date.now();

  const transactions = useQuery(
    api.queries.transactionQueries.getFilteredTransactions,
    {
      startDate,
      endDate,
    }
  );

  if (transactions === undefined) {
    return (
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-5 pt-0 overflow-x-hidden w-full">
          <PageHeader title="Transaktionen" />
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-muted-foreground">
              Transaktionen werden geladen...
            </div>
          </div>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-5 pt-0 overflow-x-hidden w-full">
        <PageHeader title="Transaktionen" />
        <DataTable columns={columns} data={transactions} />
      </div>
    </SidebarInset>
  );
}

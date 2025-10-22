"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { DataTable } from "@/components/Tables/DataTable";
import { columns } from "@/components/Tables/columns";
import { mockTransactions } from "@/components/data/mockTransactions";
import { SidebarInset } from "@/components/ui/sidebar";
import { useDateRange } from "@/contexts/DateRangeContext";

export default function Transactions() {
  const { selectedDateRange } = useDateRange();

  const filteredTransactions = mockTransactions.filter((transaction) => {
    const transactionDate = transaction.date;
    const startDate = selectedDateRange.from;
    const endDate = selectedDateRange.to;

    if (!startDate) return true;

    if (startDate && endDate) {
      return transactionDate >= startDate && transactionDate <= endDate;
    }

    return transactionDate >= startDate;
  });

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-5 pt-0 overflow-x-hidden w-full">
        <PageHeader title="Transaktionen" />
        <DataTable columns={columns} data={filteredTransactions} />
      </div>
    </SidebarInset>
  );
}

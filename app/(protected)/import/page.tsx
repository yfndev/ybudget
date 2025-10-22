"use client";

import { ImportCSVCard } from "@/components/ImportTransaction/ImportCSVCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { mockTransactions } from "@/components/data/mockTransactions";
import { Progress } from "@/components/ui/progress";
import { SidebarInset } from "@/components/ui/sidebar";
import { useDateRange } from "@/contexts/DateRangeContext";
import { useState } from "react";

export default function ImportTransactionsPage() {
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

  const [viewed, setViewed] = useState(0);
  const importedTransactions = [];
  const total = importedTransactions.length;

  return (
    <SidebarInset>
      <PageHeader title="Transaktionen zuordnen" />
      <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-5 pt-0">
        <ImportCSVCard
          amount={32.2}
          title={"AWS Invoice"}
          date={new Date()}
          currentIndex={viewed}
          totalCount={total}
        />
        <Progress
          className="absolute bottom-4 w-3/4 self-center"
          value={(viewed / total) * 10}
        />
      </div>
    </SidebarInset>
  );
}

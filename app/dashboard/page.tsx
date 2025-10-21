"use client";
import { DashboardDropdown } from "@/components/DashboardDropdown";
import { RangeCalendarToggle } from "@/components/RangeCalendarToggle";
import { TransactionSheet } from "@/components/sheets/TransactionSheet";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";

export default function Dashboard() {
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);

  return (
    <SidebarInset>
      <header className="flex w-full h-16 items-center overflow-visible">
        <div className="flex w-full items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <div className="flex w-full items-center justify-between">
            <RangeCalendarToggle />
            <DashboardDropdown
              onOpenExpense={() => setIsExpenseOpen(true)}
              onOpenIncome={() => setIsIncomeOpen(true)}
              onOpenImport={() => {}}
            />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-muted/50 aspect-video rounded-xl" />
          <div className="bg-muted/50 aspect-video rounded-xl" />
          <div className="bg-muted/50 aspect-video rounded-xl" />
        </div>
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </div>

      <TransactionSheet
        type="expense"
        open={isExpenseOpen}
        onOpenChange={setIsExpenseOpen}
      />
      <TransactionSheet
        type="income"
        open={isIncomeOpen}
        onOpenChange={setIsIncomeOpen}
      />
    </SidebarInset>
  );
}

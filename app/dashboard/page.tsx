"use client";
import BudgetCard from "@/components/Dashboard/BudgetCard";
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
      <div className="px-6">
        <header className="flex w-full h-16 items-center overflow-visible">
          <div className="flex w-full items-center gap-2">
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
        <div className="flex flex-row gap-6  justify-between">
          <BudgetCard
            title={"Offenes Budget"}
            amount={4019}
            changePercent={2.4}
          />
          <BudgetCard title={"Verplant"} amount={14920} changePercent={9.2} />
          <BudgetCard title={"Ausgegeben"} amount={3900} changePercent={-8.9} />
          <BudgetCard
            title={"Eingenommen"}
            amount={250}
            changePercent={-15.2}
          />
        </div>
      </div>
    </SidebarInset>
  );
}

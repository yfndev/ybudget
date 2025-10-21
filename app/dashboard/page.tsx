"use client";
import BudgetCard from "@/components/Dashboard/BudgetCard";
import { BudgetChart } from "@/components/Dashboard/BudgetChart";
import { CategoryChart } from "@/components/Dashboard/CategoryChart";
import ProjectCard from "@/components/Dashboard/ProjectCard";
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
      <div className="px-4 lg:px-6 pb-6">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
        <div className="flex flex-col lg:flex-row h-auto lg:h-[400px] w-full gap-4 lg:gap-6 mt-4 lg:mt-6">
          <BudgetChart />
          <CategoryChart />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full gap-4 lg:gap-6 mt-4 lg:mt-6">
          <ProjectCard
            title={"YFN 9.0"}
            description={
              "Unser 9. Event, welches im Anschluss an die YFC stattfindet. Es wird finanziert aus dem Bertelsmann Geld, 100 Teilnehmende."
            }
            progress={30}
          />
          <ProjectCard
            title={"YFN 9.0"}
            description={
              "Unser 9. Event, welches im Anschluss an die YFC stattfindet. Es wird finanziert aus dem Bertelsmann Geld, 100 Teilnehmende."
            }
            progress={30}
          />
          <ProjectCard
            title={"YFN 9.0"}
            description={
              "Unser 9. Event, welches im Anschluss an die YFC stattfindet. Es wird finanziert aus dem Bertelsmann Geld, 100 Teilnehmende."
            }
            progress={30}
          />
          <ProjectCard
            title={"YFN 9.0"}
            description={
              "Unser 9. Event, welches im Anschluss an die YFC stattfindet. Es wird finanziert aus dem Bertelsmann Geld, 100 Teilnehmende."
            }
            progress={30}
          />
          <ProjectCard
            title={"YFN 9.0"}
            description={
              "Unser 9. Event, welches im Anschluss an die YFC stattfindet. Es wird finanziert aus dem Bertelsmann Geld, 100 Teilnehmende."
            }
            progress={30}
          />
        </div>
      </div>
    </SidebarInset>
  );
}

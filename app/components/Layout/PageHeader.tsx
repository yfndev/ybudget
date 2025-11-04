"use client";

import { DashboardDropdown } from "@/components/Dashboard/DashboardDropdown";
import { RangeCalendarToggle } from "@/components/RangeCalendar/RangeCalendarToggle";
import { ImportTransactionsSheet } from "@/components/Sheets/ImportTransactionsSheet";
import { TransactionSheet } from "@/components/Sheets/TransactionSheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateCategoryDialog } from "../dialogs/CreateCategoryDialog";
import { AddDonorDialog } from "../Sheets/AddDonorDialog";
import { Skeleton } from "../ui/skeleton";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export function PageHeader({
  title,
  subtitle,
  showBackButton = false,
  backUrl,
}: PageHeaderProps) {
  const router = useRouter();
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDonorOpen, setIsDonorOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const handleBackClick = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <>
      <header className="flex w-full h-16 items-center overflow-visible">
        <div className="flex w-full items-center gap-2 ">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackClick}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                {title ? (
                  <h1 className="text-xl font-semibold">{title}</h1>
                ) : (
                  <Skeleton className="h-7 w-48" />
                )}
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex flex-row gap-4">
              <RangeCalendarToggle />

              <DashboardDropdown
                onOpenExpense={() => setIsExpenseOpen(true)}
                onOpenIncome={() => setIsIncomeOpen(true)}
                onOpenImport={() => setIsImportOpen(true)}
                onOpenDonor={() => setIsDonorOpen(true)}
                onOpenCategory={() => setIsCategoryOpen(true)}
              />
            </div>
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
      <ImportTransactionsSheet
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
      />
      <AddDonorDialog open={isDonorOpen} onOpenChange={setIsDonorOpen} />
      <CreateCategoryDialog
        open={isCategoryOpen}
        onOpenChange={setIsCategoryOpen}
      />
    </>
  );
}

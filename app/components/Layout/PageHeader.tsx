"use client";

import { DashboardDropdown } from "@/components/Dashboard/DashboardDropdown";
import { CreateCategoryDialog } from "@/components/Dialogs/CreateCategoryDialog";
import { RangeCalendarToggle } from "@/components/RangeCalendar/RangeCalendarToggle";
import { AddDonorDialog } from "@/components/Sheets/AddDonorDialog";
import { CreateProjectDialog } from "@/components/Sheets/CreateProjectDialog";
import { ImportTransactionsSheet } from "@/components/Sheets/ImportTransactionsSheet";
import { TransactionSheet } from "@/components/Sheets/TransactionSheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [isProjectOpen, setIsProjectOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && (e.code === "KeyE" || e.key === "e")) {
        e.preventDefault();
        setIsExpenseOpen(true);
      } else if (e.metaKey && (e.code === "KeyI" || e.key === "i")) {
        e.preventDefault();
        setIsIncomeOpen(true);
      } else if (e.metaKey && e.code === "KeyP") {
        e.preventDefault();
        setIsProjectOpen(true);
      } else if (e.metaKey && e.code === "KeyD") {
        e.preventDefault();
        setIsDonorOpen(true);
      } else if (e.metaKey && e.code === "KeyK") {
        e.preventDefault();
        setIsCategoryOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleBackClick = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <>
      <header
        className="flex  w-full h-16 items-center overflow-visible"
        id="tour-page-header"
      >
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

              <div id="tour-add-dropdown">
                <DashboardDropdown
                  onOpenExpense={() => setIsExpenseOpen(true)}
                  onOpenIncome={() => setIsIncomeOpen(true)}
                  onOpenImport={() => setIsImportOpen(true)}
                  onOpenDonor={() => setIsDonorOpen(true)}
                  onOpenCategory={() => setIsCategoryOpen(true)}
                  onOpenProject={() => setIsProjectOpen(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div id="tour-expense-sheet">
        <TransactionSheet
          type="expense"
          open={isExpenseOpen}
          onOpenChange={setIsExpenseOpen}
        />
      </div>
      <div id="tour-income-sheet">
        <TransactionSheet
          type="income"
          open={isIncomeOpen}
          onOpenChange={setIsIncomeOpen}
        />
      </div>
      <div id="tour-csv-upload">
        <ImportTransactionsSheet
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
        />
      </div>
      <AddDonorDialog open={isDonorOpen} onOpenChange={setIsDonorOpen} />
      <CreateCategoryDialog
        open={isCategoryOpen}
        onOpenChange={setIsCategoryOpen}
      />
      <CreateProjectDialog
        open={isProjectOpen}
        onOpenChange={setIsProjectOpen}
      />
      <div id="tour-transaction-form" className="hidden" />
      <div id="tour-csv-preview" className="hidden" />
    </>
  );
}

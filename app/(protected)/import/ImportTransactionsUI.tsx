import BudgetSplit from "@/components/ImportTransactions/BudgetSplit";
import { ExpectedTransactionMatchesUI } from "@/components/ImportTransactions/ExpectedTransactionMatchesUI";
import { ImportTransactionCardUI } from "@/components/ImportTransactions/ImportTransactionCardUI";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Progress } from "@/components/ui/progress";
import type { Doc } from "@/convex/_generated/dataModel";

interface ImportTransactionsUIProps {
  current: Doc<"transactions"> | null;
  index: number;
  totalCount: number;
  projectId: string;
  categoryId: string;
  donorId: string;
  selectedMatch: string | null;
  splitIncome: boolean;
  expectedTransactions: Doc<"transactions">[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  setProjectId: (value: string) => void;
  setCategoryId: (value: string) => void;
  setDonorId: (value: string) => void;
  handleExpectedTransactionSelect: (id: string) => void;
  onSplitIncomeChange: (splitIncome: boolean) => void;
  onBudgetAllocationsChange: (
    allocations: Array<{ projectId: string; amount: number }>,
  ) => void;
}

export const ImportTransactionsUI = ({
  current,
  index,
  totalCount,
  projectId,
  categoryId,
  donorId,
  selectedMatch,
  splitIncome,
  expectedTransactions,
  containerRef,
  setProjectId,
  setCategoryId,
  setDonorId,
  handleExpectedTransactionSelect,
  onSplitIncomeChange,
  onBudgetAllocationsChange,
}: ImportTransactionsUIProps) => {
  if (totalCount === 0) {
    return (
      <div id="tour-import-page">
        <PageHeader title="Transaktionen zuordnen" />
        <div className="flex items-center justify-center">
          <p className="text-lg text-muted-foreground">
            Es gibt keine Transaktionen zum Zuordnen. <br />
            Oben rechts kannst du neue Transaktionen importieren :)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="tour-import-page">
      <PageHeader title="Transaktionen zuordnen" />
      <div className="flex mt-8 justify-center" id="tour-import-progress">
        <Progress className="w-3/4" value={((index + 1) / totalCount) * 100} />
      </div>
      <div className="flex mt-24 h-full justify-between">
        <div id="tour-expected-matches">
          <ExpectedTransactionMatchesUI
            expectedTransactions={expectedTransactions}
            selectedMatch={selectedMatch}
            containerRef={containerRef}
            onSelect={handleExpectedTransactionSelect}
          />
        </div>
        <div id="tour-import-card">
          {current && (
            <ImportTransactionCardUI
              title={current.counterparty || ""}
              description={current.description}
              amount={current.amount}
              date={new Date(current.date)}
              currentIndex={index + 1}
              totalCount={totalCount}
              projectId={projectId}
              categoryId={categoryId}
              donorId={donorId}
              isExpense={current.amount < 0}
              isIncome={current.amount > 0}
              splitIncome={splitIncome}
              onProjectChange={setProjectId}
              onCategoryChange={setCategoryId}
              onDonorChange={setDonorId}
              onSplitIncomeChange={onSplitIncomeChange}
            />
          )}
        </div>
        <div className="flex p-6 rounded-lg w-1/4">
          {splitIncome && current && current.amount > 0 && (
            <BudgetSplit
              totalAmount={current.amount}
              onAllocationsChange={onBudgetAllocationsChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

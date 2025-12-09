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
  setProjectId: (value: string) => void;
  setCategoryId: (value: string) => void;
  setDonorId: (value: string) => void;
  handleExpectedTransactionSelect: (id: string) => void;
  onSplitIncomeChange: (splitIncome: boolean) => void;
  onBudgetsChange: (
    budgets: Array<{ projectId: string; amount: number }>,
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
  setProjectId,
  setCategoryId,
  setDonorId,
  handleExpectedTransactionSelect,
  onSplitIncomeChange,
  onBudgetsChange,
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

  const hasMatches = expectedTransactions.length > 0;

  return (
    <div id="tour-import-page">
      <PageHeader title="Transaktionen zuordnen" />
      <div className="flex mt-8 justify-center" id="tour-import-progress">
        <Progress className="w-3/4" value={((index + 1) / totalCount) * 100} />
      </div>
      <div
        className={`flex flex-col mt-12 gap-8 ${hasMatches ? "lg:flex-row" : "items-center"}`}
      >
        {hasMatches && (
          <div
            id="tour-expected-matches"
            className="lg:w-72 shrink-0 order-2 lg:order-1"
          >
            <ExpectedTransactionMatchesUI
              expectedTransactions={expectedTransactions}
              selectedMatch={selectedMatch}
              onSelect={handleExpectedTransactionSelect}
            />
          </div>
        )}
        <div
          className={`flex flex-col xl:flex-row items-start gap-8 order-1 lg:order-2 ${hasMatches ? "flex-1" : "w-full justify-center"}`}
        >
          <div id="tour-import-card" className="w-full max-w-xl">
            {current && (
              <ImportTransactionCardUI
                transaction={current}
                currentIndex={index + 1}
                totalCount={totalCount}
                projectId={projectId}
                categoryId={categoryId}
                donorId={donorId}
                splitIncome={splitIncome}
                onProjectChange={setProjectId}
                onCategoryChange={setCategoryId}
                onDonorChange={setDonorId}
                onSplitIncomeChange={onSplitIncomeChange}
              />
            )}
          </div>
          {splitIncome && current && current.amount > 0 && (
            <div className="w-full max-w-md">
              <BudgetSplit
                totalAmount={current.amount}
                onBudgetsChange={onBudgetsChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

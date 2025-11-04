import { ExpectedTransactionMatches } from "@/components/ImportTransactions/ExpectedTransactionMatches";
import { ImportTransactionCard } from "@/components/ImportTransactions/ImportTransactionCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Progress } from "@/components/ui/progress";
import type { Doc } from "../../../convex/_generated/dataModel";
import type { ImportFormState } from "../../hooks/ImportTransactions/useImportForm";

interface ImportTransactionsPageUIProps {
  expectedTransactions: Doc<"transactions">[];
  current: Doc<"transactions"> | null;
  index: number;
  totalCount: number;
  form: ImportFormState & {
    setProjectId: (v: string) => void;
    setCategoryId: (v: string) => void;
    setDonorId: (v: string) => void;
    setSelectedDonationIds: (ids: any[]) => void;
  };
  onExpectedTransactionSelect: (expectedTransactionId: string) => void;
}

export default function ImportTransactionsPageUI({
  expectedTransactions,
  current,
  index,
  totalCount,
  form,
  onExpectedTransactionSelect,
}: ImportTransactionsPageUIProps) {
  return (
    <div id="tour-import-page">
      <PageHeader title="Transaktionen zuordnen" />

      {totalCount === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              Es gibt keine Transaktionen zum Zuordnen
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 flex mt-16 gap-16">
            <div id="tour-expected-matches">
              <ExpectedTransactionMatches
                expectedTransactions={expectedTransactions}
                onSelect={onExpectedTransactionSelect}
              />
            </div>
            {current && (
              <div className="mt-16 flex-shrink-0" id="tour-import-card">
                <ImportTransactionCard
                  title={current.counterparty || ""}
                  description={current.description}
                  amount={current.amount}
                  date={new Date(current.date)}
                  currentIndex={index + 1}
                  totalCount={totalCount}
                  projectId={form.projectId}
                  categoryId={form.categoryId}
                  donorId={form.donorId}
                  selectedDonationIds={form.selectedDonationIds}
                  onProjectChange={form.setProjectId}
                  onCategoryChange={form.setCategoryId}
                  onDonorChange={form.setDonorId}
                  onDonationIdsChange={form.setSelectedDonationIds}
                />
              </div>
            )}
          </div>
          <div className="mt-auto pt-6" id="tour-import-progress">
            <Progress
              className="w-3/4 mx-auto"
              value={totalCount > 0 ? ((index + 1) / totalCount) * 100 : 0}
            />
          </div>
        </>
      )}
    </div>
  );
}

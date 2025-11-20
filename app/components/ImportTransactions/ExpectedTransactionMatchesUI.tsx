import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";

interface ExpectedTransaction {
  _id: string;
  description: string;
  amount: number;
  date: number;
  counterparty: string;
}

interface ExpectedTransactionMatchesUIProps {
  expectedTransactions: ExpectedTransaction[];
  selectedMatch: string | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (id: string) => void;
}

export const ExpectedTransactionMatchesUI = ({
  expectedTransactions,
  selectedMatch,
  containerRef,
  onSelect,
}: ExpectedTransactionMatchesUIProps) => {
  const hasTransactions = expectedTransactions.length > 0;

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>}>
      <h3 className="text-xl font-semibold mb-6">Geplante Ausgabe matchen:</h3>
      {!hasTransactions && (
        <p className="text-sm text-muted-foreground">
          Keine möglichen Matches gefunden :)
        </p>
      )}

      {hasTransactions &&
        expectedTransactions.map((transaction) => {
          const isSelected = selectedMatch === transaction._id;
          const baseClasses =
            "cursor-pointer transition-all my-2 px-4 py-3 border rounded-sm";
          const stateClasses = isSelected
            ? "bg-primary/5 border-l-4 border-l-primary"
            : "hover:bg-accent";

          return (
            <div
              key={transaction._id}
              className={`${baseClasses} ${stateClasses}`}
              onClick={() => onSelect(transaction._id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold mb-1">
                    {transaction.counterparty}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {transaction.description}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 ml-4">
                  <span className="font-semibold whitespace-nowrap">
                    {formatCurrency(transaction.amount)}
                  </span>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(transaction.date)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

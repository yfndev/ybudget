import type { Doc } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { formatDate } from "@/lib/formatters/formatDate";

interface ExpectedTransactionMatchesUIProps {
  expectedTransactions: Doc<"transactions">[];
  selectedMatch: string | null;
  onSelect: (id: string) => void;
}

export const ExpectedTransactionMatchesUI = ({
  expectedTransactions,
  selectedMatch,
  onSelect,
}: ExpectedTransactionMatchesUIProps) => {
  if (!expectedTransactions.length) {
    return (
      <div>
        <h3 className="text-xl font-semibold mb-6">
          Geplante Ausgabe matchen:
        </h3>
        <p className="text-sm text-muted-foreground">
          Keine möglichen Matches gefunden :)
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Geplante Ausgabe matchen:</h3>
      {expectedTransactions.map((transaction) => {
        const isSelected = selectedMatch === transaction._id;

        return (
          <div
            key={transaction._id}
            className={`cursor-pointer transition-all my-2 px-4 py-3 border rounded-sm ${
              isSelected
                ? "bg-primary/5 border-l-4 border-l-primary"
                : "hover:bg-accent"
            }`}
            onClick={() => onSelect(transaction._id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold mb-1">{transaction.counterparty}</p>
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

import { Card, CardContent } from "@/components/ui/card";

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
  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className="flex flex-col"
    >
      <h3 className="text-2xl font-semibold mb-6">Matche geplante Ausgaben:</h3>

      {expectedTransactions.length > 0 ? (
        <div className="flex flex-col gap-4">
          {expectedTransactions.map((transaction) => (
            <Card
              key={transaction._id}
              className={`cursor-pointer transition-all ${
                selectedMatch === transaction._id
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => onSelect(transaction._id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between w-full ">
                  <div className="flex-1">
                    <p className="font-semibold text-base mb-1">
                      {transaction.counterparty}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {transaction.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(transaction.date).toLocaleDateString("de-DE")}
                    </span>
                    <span className="font-semibold text-base whitespace-nowrap">
                      {new Intl.NumberFormat("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      }).format(Math.abs(transaction.amount))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Keine möglichen Matches vorhanden
        </p>
      )}
    </div>
  );
};

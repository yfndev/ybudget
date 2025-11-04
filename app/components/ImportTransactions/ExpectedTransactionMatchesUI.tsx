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
      className="w-1/4 flex flex-col h-full flex-shrink-0"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Matche geplante Ausgaben:</h3>
      </div>
      {expectedTransactions.length > 0 ? (
        <div className="space-y-3">
          {expectedTransactions.map((match) => (
            <div
              key={match._id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedMatch === match._id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => onSelect(match._id)}
            >
              <div className="flex justify-between gap-5 items-center text-xs">
                <div className="mb-2">
                  <p className="font-semibold text-sm">{match.counterparty}</p>
                  <p className="text-sm">{match.description}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-muted-foreground">
                    {new Date(match.date).toLocaleDateString("de-DE")}
                  </span>
                  <span className="font-medium pt-4">
                    {new Intl.NumberFormat("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    }).format(Math.abs(match.amount))}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          Keine möglichen Matches vorhanden
        </div>
      )}
    </div>
  );
};

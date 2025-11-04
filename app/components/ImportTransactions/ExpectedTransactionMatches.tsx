import { useEffect, useRef, useState } from "react";
import { ExpectedTransactionMatchesUI } from "./ExpectedTransactionMatchesUI";

interface ExpectedTransaction {
  _id: string;
  description: string;
  amount: number;
  date: number;
  projectName?: string;
  counterparty: string;
}

interface ExpectedTransactionMatchesProps {
  expectedTransactions: ExpectedTransaction[];
  onSelect?: (transactionId: string) => void;
}

export const ExpectedTransactionMatches = ({
  expectedTransactions,
  onSelect,
}: ExpectedTransactionMatchesProps) => {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setSelectedMatch(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (id: string) => {
    setSelectedMatch(id);
    onSelect?.(id);
  };

  return (
    <ExpectedTransactionMatchesUI
      expectedTransactions={expectedTransactions}
      selectedMatch={selectedMatch}
      containerRef={containerRef}
      onSelect={handleSelect}
    />
  );
};

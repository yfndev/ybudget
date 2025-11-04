import type { Doc } from "../../convex/_generated/dataModel";

interface DateRange {
  from: Date;
  to: Date;
}

export function filterTransactionsByDateRange(
  transactions: Doc<"transactions">[] | undefined,
  dateRange: DateRange,
): Doc<"transactions">[] | undefined {
  if (!transactions) return undefined;

  const startDate = dateRange.from.getTime();
  const endDate = dateRange.to.getTime();

  return transactions.filter((t) => t.date >= startDate && t.date <= endDate);
}

export function filterTransactionsBeforeDate(
  transactions: Doc<"transactions">[] | undefined,
  beforeDate: Date,
  additionalFilter?: (t: Doc<"transactions">) => boolean,
): Doc<"transactions">[] | undefined {
  if (!transactions) return undefined;

  const beforeTimestamp = beforeDate.getTime();

  return transactions.filter((t) => {
    const dateMatches = t.date < beforeTimestamp;
    const additionalMatches = additionalFilter ? additionalFilter(t) : true;
    return dateMatches && additionalMatches;
  });
}

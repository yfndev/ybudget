import type { Doc } from "@/convex/_generated/dataModel";

interface DateRange {
  from: Date;
  to: Date;
}

export type EnrichedTransaction = Doc<"transactions"> & {
  projectName?: string;
  categoryName?: string;
};

export function filterTransactionsByDateRange(
  transactions: EnrichedTransaction[] | undefined,
  dateRange: DateRange,
): EnrichedTransaction[] | undefined {
  if (!transactions) return undefined;

  const startDate = dateRange.from.getTime();
  const endDate = dateRange.to.getTime();

  return transactions.filter((t) => t.date >= startDate && t.date <= endDate);
}

export function filterTransactionsBeforeDate(
  transactions: EnrichedTransaction[] | undefined,
  beforeDate: Date,
  additionalFilter?: (t: EnrichedTransaction) => boolean,
): EnrichedTransaction[] | undefined {
  if (!transactions) return undefined;

  const beforeTimestamp = beforeDate.getTime();

  return transactions.filter((t) => {
    const dateMatches = t.date < beforeTimestamp;
    const additionalMatches = additionalFilter ? additionalFilter(t) : true;
    return dateMatches && additionalMatches;
  });
}

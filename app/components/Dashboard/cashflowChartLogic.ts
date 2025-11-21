import {
  aggregateTransactionsForPeriod,
  calculatePeriodBalance,
  determinePeriods,
  findBalanceRange,
  findMaxBarValue,
} from "@/components/Dashboard/cashflowHelpers";
import type { Doc } from "@/convex/_generated/dataModel";
import { differenceInDays, differenceInMonths } from "date-fns";

export type CashflowDataPoint = {
  date: string;
  actualIncome: number;
  expectedIncome: number;
  actualExpenses: number;
  expectedExpenses: number;
  balance: number;
  timestamp: number;
};

export function generateCashflowData(
  transactions: Doc<"transactions">[],
  startBalance: number,
  rangeStart: Date,
  rangeEnd: Date,
): CashflowDataPoint[] {
  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return transactionDate >= rangeStart && transactionDate <= rangeEnd;
  });

  const sortedTransactions = filteredTransactions.sort((a, b) => a.date - b.date);
  const periods = determinePeriods(rangeStart, rangeEnd);

  return periods.map((period) => {
    const periodStartTime = period.start.getTime();
    const periodEndTime = period.end.getTime();

    const periodTransactions = sortedTransactions.filter(
      (t) => t.date >= periodStartTime && t.date < periodEndTime
    );

    const aggregation = aggregateTransactionsForPeriod(periodTransactions);
    const periodBalance = calculatePeriodBalance(sortedTransactions, startBalance, periodEndTime);

    return {
      date: period.label,
      actualIncome: aggregation.processedIncome,
      expectedIncome: aggregation.expectedIncome,
      actualExpenses: -aggregation.processedExpenses,
      expectedExpenses: -aggregation.expectedExpenses,
      balance: periodBalance,
      timestamp: periodStartTime,
    };
  });
}

export function calculateStartBalance(
  transactions: Doc<"transactions">[] | undefined,
): number {
  if (!transactions) return 0;
  return transactions
    .filter((t) => t.status === "processed")
    .reduce((total, t) => total + t.amount, 0);
}

function getTickInterval(maxValue: number): number {
  if (maxValue <= 100) return 50;
  if (maxValue <= 500) return 100;
  if (maxValue <= 1000) return 200;
  if (maxValue <= 5000) return 1000;
  if (maxValue <= 10000) return 2000;
  if (maxValue <= 50000) return 5000;
  if (maxValue <= 100000) return 10000;
  if (maxValue <= 500000) return 50000;
  return 100000;
}

export function calculateAxisConfig(
  dataPoints: CashflowDataPoint[],
  rangeStart: Date,
  rangeEnd: Date,
) {
  const monthsDiff = differenceInMonths(rangeEnd, rangeStart);
  const daysDiff = differenceInDays(rangeEnd, rangeStart);

  const maxBarValue = findMaxBarValue(dataPoints);
  const balanceRange = findBalanceRange(dataPoints);
  const maxAbsBalance = Math.max(Math.abs(balanceRange.min), Math.abs(balanceRange.max));
  const maxAbsValue = Math.max(maxBarValue, maxAbsBalance);

  const tickInterval = getTickInterval(maxAbsValue);
  const roundedMax = Math.ceil(maxAbsValue / tickInterval) * tickInterval;

  const yAxisTicks: number[] = [];
  for (let i = -roundedMax; i <= roundedMax; i += tickInterval) {
    yAxisTicks.push(i);
  }

  const isLongPeriod = monthsDiff >= 11 || daysDiff >= 335;
  const xAxisInterval = isLongPeriod
    ? 0
    : monthsDiff >= 3 || daysDiff > 90
      ? Math.max(0, Math.floor((dataPoints.length - 1) / 12))
      : Math.max(0, Math.floor((dataPoints.length - 1) / 10));

  return {
    xAxisInterval,
    yAxisTicks,
    roundedMaxBarValue: roundedMax,
    maxBarValue,
    isLongPeriod,
    isManyDataPoints: dataPoints.length > 31,
  };
}

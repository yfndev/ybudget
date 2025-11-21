import type { Doc } from "@/convex/_generated/dataModel";
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInDays,
  differenceInMonths,
  eachDayOfInterval,
  eachMonthOfInterval,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { de } from "date-fns/locale";

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

  const sortedTransactions = filteredTransactions.sort(
    (a, b) => a.date - b.date,
  );

  const monthsDiff = differenceInMonths(rangeEnd, rangeStart);
  const daysDiff = differenceInDays(rangeEnd, rangeStart);

  let periods: Array<{ start: Date; end: Date; label: string }> = [];

  if (monthsDiff >= 11 || daysDiff >= 335) {
    const months = eachMonthOfInterval({
      start: rangeStart,
      end: rangeEnd,
    });
    periods = months.map((monthDate) => {
      const monthStart = startOfMonth(monthDate);
      const monthEnd = addMonths(monthStart, 1);
      return {
        start: monthStart,
        end: monthEnd > rangeEnd ? rangeEnd : monthEnd,
        label: format(monthDate, "MMM", { locale: de }),
      };
    });
  } else if (monthsDiff >= 3 || daysDiff > 90) {
    const weekStart = startOfWeek(rangeStart, { weekStartsOn: 1 });
    const totalWeeks = Math.ceil(
      (rangeEnd.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000),
    );
    for (let i = 0; i <= totalWeeks; i++) {
      const weekDate = addWeeks(weekStart, i);
      if (weekDate > rangeEnd) break;
      const weekEnd = addWeeks(weekDate, 1);
      periods.push({
        start: weekDate,
        end: weekEnd > rangeEnd ? rangeEnd : weekEnd,
        label: format(weekDate, "d. MMM", { locale: de }),
      });
    }
  } else {
    const days = eachDayOfInterval({
      start: rangeStart,
      end: rangeEnd,
    });
    periods = days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = addDays(dayStart, 1);
      return {
        start: dayStart,
        end: dayEnd > rangeEnd ? rangeEnd : dayEnd,
        label: format(day, "d", { locale: de }),
      };
    });
  }

  const result: CashflowDataPoint[] = [];

  for (const period of periods) {
    const periodStartTime = period.start.getTime();
    const periodEndTime = period.end.getTime();

    const periodTransactions = sortedTransactions.filter(
      (t) => t.date >= periodStartTime && t.date < periodEndTime,
    );

    const processedTransactions = periodTransactions.filter(
      (t) => t.status === "processed",
    );
    const expectedTransactions = periodTransactions.filter(
      (t) => t.status === "expected",
    );

    let processedIncome = 0;
    for (const t of processedTransactions) {
      if (t.amount > 0) {
        processedIncome += t.amount;
      }
    }

    let expectedIncome = 0;
    for (const t of expectedTransactions) {
      if (t.amount > 0) {
        expectedIncome += t.amount;
      }
    }

    let processedExpenses = 0;
    for (const t of processedTransactions) {
      if (t.amount < 0) {
        processedExpenses += Math.abs(t.amount);
      }
    }

    let expectedExpenses = 0;
    for (const t of expectedTransactions) {
      if (t.amount < 0) {
        expectedExpenses += Math.abs(t.amount);
      }
    }

    let periodBalance = startBalance;
    for (const transaction of sortedTransactions) {
      if (transaction.date < periodEndTime) {
        periodBalance += transaction.amount;
      }
    }

    result.push({
      date: period.label,
      actualIncome: processedIncome,
      expectedIncome: expectedIncome,
      actualExpenses: -processedExpenses,
      expectedExpenses: -expectedExpenses,
      balance: periodBalance,
      timestamp: periodStartTime,
    });
  }

  return result;
}

export function calculateStartBalance(
  transactions: Doc<"transactions">[] | undefined,
): number {
  if (!transactions) return 0;

  let total = 0;
  for (const t of transactions) {
    if (t.status === "processed") {
      total += t.amount;
    }
  }
  return total;
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

  let maxBarValue = 0;
  for (const d of dataPoints) {
    const totalIncome = Math.abs(d.actualIncome + d.expectedIncome);
    const totalExpenses = Math.abs(d.actualExpenses + d.expectedExpenses);
    const max = Math.max(totalIncome, totalExpenses);
    if (max > maxBarValue) {
      maxBarValue = max;
    }
  }

  let minBalance = 0;
  let maxBalance = 0;
  if (dataPoints.length > 0) {
    minBalance = dataPoints[0].balance;
    maxBalance = dataPoints[0].balance;
    for (const d of dataPoints) {
      if (d.balance < minBalance) {
        minBalance = d.balance;
      }
      if (d.balance > maxBalance) {
        maxBalance = d.balance;
      }
    }
  }

  const maxAbsBalance = Math.max(Math.abs(minBalance), Math.abs(maxBalance));
  const maxAbsValue = Math.max(maxBarValue, maxAbsBalance);

  const tickInterval = getTickInterval(maxAbsValue);
  const roundedMax = Math.ceil(maxAbsValue / tickInterval) * tickInterval;

  const yAxisTicks: number[] = [];
  for (let i = -roundedMax; i <= roundedMax; i += tickInterval) {
    yAxisTicks.push(i);
  }

  let xAxisInterval = 0;
  if (monthsDiff >= 11 || daysDiff >= 335) {
    xAxisInterval = 0;
  } else if (monthsDiff >= 3 || daysDiff > 90) {
    xAxisInterval = Math.max(0, Math.floor((dataPoints.length - 1) / 12));
  } else {
    xAxisInterval = Math.max(0, Math.floor((dataPoints.length - 1) / 10));
  }

  const isLongPeriod = monthsDiff >= 11 || daysDiff >= 335;
  const isManyDataPoints = dataPoints.length > 31;

  return {
    xAxisInterval,
    yAxisTicks,
    roundedMaxBarValue: roundedMax,
    maxBarValue,
    isLongPeriod,
    isManyDataPoints,
  };
}

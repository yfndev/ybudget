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

type Period = { start: Date; end: Date; label: string };

export function determinePeriods(rangeStart: Date, rangeEnd: Date): Period[] {
  const monthsDiff = differenceInMonths(rangeEnd, rangeStart);
  const daysDiff = differenceInDays(rangeEnd, rangeStart);

  if (monthsDiff >= 11 || daysDiff >= 335) {
    return eachMonthOfInterval({ start: rangeStart, end: rangeEnd }).map((monthDate) => {
      const monthStart = startOfMonth(monthDate);
      const monthEnd = addMonths(monthStart, 1);
      return {
        start: monthStart,
        end: monthEnd > rangeEnd ? rangeEnd : monthEnd,
        label: format(monthDate, "MMM", { locale: de }),
      };
    });
  }

  if (monthsDiff >= 3 || daysDiff > 90) {
    const weekStart = startOfWeek(rangeStart, { weekStartsOn: 1 });
    const totalWeeks = Math.ceil(
      (rangeEnd.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const periods: Period[] = [];
    
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
    return periods;
  }

  return eachDayOfInterval({ start: rangeStart, end: rangeEnd }).map((day) => {
    const dayStart = startOfDay(day);
    const dayEnd = addDays(dayStart, 1);
    return {
      start: dayStart,
      end: dayEnd > rangeEnd ? rangeEnd : dayEnd,
      label: format(day, "d", { locale: de }),
    };
  });
}

interface PeriodAggregation {
  processedIncome: number;
  expectedIncome: number;
  processedExpenses: number;
  expectedExpenses: number;
}

export function aggregateTransactionsForPeriod(
  transactions: Doc<"transactions">[]
): PeriodAggregation {
  const processed = transactions.filter((t) => t.status === "processed");
  const expected = transactions.filter((t) => t.status === "expected");

  return {
    processedIncome: processed.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0),
    expectedIncome: expected.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0),
    processedExpenses: processed.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0),
    expectedExpenses: expected.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0),
  };
}

export function calculatePeriodBalance(
  allTransactions: Doc<"transactions">[],
  startBalance: number,
  periodEndTime: number
): number {
  return allTransactions.reduce((balance, transaction) => {
    return transaction.date < periodEndTime ? balance + transaction.amount : balance;
  }, startBalance);
}

export function findMaxBarValue(dataPoints: Array<{ actualIncome: number; expectedIncome: number; actualExpenses: number; expectedExpenses: number }>): number {
  return dataPoints.reduce((max, d) => {
    const totalIncome = Math.abs(d.actualIncome + d.expectedIncome);
    const totalExpenses = Math.abs(d.actualExpenses + d.expectedExpenses);
    return Math.max(max, totalIncome, totalExpenses);
  }, 0);
}

export function findBalanceRange(dataPoints: Array<{ balance: number }>): { min: number; max: number } {
  if (dataPoints.length === 0) return { min: 0, max: 0 };
  
  return dataPoints.reduce(
    (range, d) => ({
      min: Math.min(range.min, d.balance),
      max: Math.max(range.max, d.balance),
    }),
    { min: dataPoints[0].balance, max: dataPoints[0].balance }
  );
}

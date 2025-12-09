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

export interface CashflowDataPoint {
  date: string;
  actualIncome: number;
  expectedIncome: number;
  actualExpenses: number;
  expectedExpenses: number;
  balance: number;
  timestamp: number;
}

interface TimeSlot {
  start: Date;
  end: Date;
  label: string;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isMonthlyRange(from: Date, to: Date): boolean {
  return (
    differenceInMonths(to, from) >= 11 || differenceInDays(to, from) >= 335
  );
}

function isWeeklyRange(from: Date, to: Date): boolean {
  return differenceInMonths(to, from) >= 3 || differenceInDays(to, from) > 90;
}

function createMonthTimeSlots(from: Date, to: Date): TimeSlot[] {
  return eachMonthOfInterval({ start: from, end: to }).map((monthDate) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = addMonths(monthStart, 1);
    return {
      start: monthStart,
      end: monthEnd > to ? to : monthEnd,
      label: format(monthDate, "MMM", { locale: de }),
    };
  });
}

function createWeekTimeSlots(from: Date, to: Date): TimeSlot[] {
  const weekStart = startOfWeek(from, { weekStartsOn: 1 });
  const totalWeeks = Math.ceil((to.getTime() - weekStart.getTime()) / WEEK_MS);
  const slots: TimeSlot[] = [];

  for (let index = 0; index <= totalWeeks; index++) {
    const weekDate = addWeeks(weekStart, index);
    if (weekDate > to) break;
    const weekEnd = addWeeks(weekDate, 1);
    slots.push({
      start: weekDate,
      end: weekEnd > to ? to : weekEnd,
      label: format(weekDate, "d. MMM", { locale: de }),
    });
  }
  return slots;
}

function createDayTimeSlots(from: Date, to: Date): TimeSlot[] {
  return eachDayOfInterval({ start: from, end: to }).map((day) => {
    const dayStart = startOfDay(day);
    const dayEnd = addDays(dayStart, 1);
    return {
      start: dayStart,
      end: dayEnd > to ? to : dayEnd,
      label: format(day, "d", { locale: de }),
    };
  });
}

function determineTimeSlots(from: Date, to: Date): TimeSlot[] {
  if (isMonthlyRange(from, to)) return createMonthTimeSlots(from, to);
  if (isWeeklyRange(from, to)) return createWeekTimeSlots(from, to);
  return createDayTimeSlots(from, to);
}

function sumIncome(transactions: Doc<"transactions">[]): number {
  return transactions.reduce(
    (sum, t) => sum + (t.amount > 0 ? t.amount : 0),
    0,
  );
}

function sumExpenses(transactions: Doc<"transactions">[]): number {
  return transactions.reduce(
    (sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0),
    0,
  );
}

function aggregateTransactions(transactions: Doc<"transactions">[]) {
  const processed = transactions.filter((t) => t.status === "processed");
  const expected = transactions.filter((t) => t.status === "expected");

  return {
    processedIncome: sumIncome(processed),
    expectedIncome: sumIncome(expected),
    processedExpenses: sumExpenses(processed),
    expectedExpenses: sumExpenses(expected),
  };
}

function calculateBalance(
  transactions: Doc<"transactions">[],
  startBalance: number,
  endTime: number,
): number {
  return transactions.reduce(
    (balance, t) => (t.date < endTime ? balance + t.amount : balance),
    startBalance,
  );
}

export function buildCashflowData(
  transactions: Doc<"transactions">[],
  startBalance: number,
  from: Date,
  to: Date,
): CashflowDataPoint[] {
  const filtered = transactions
    .filter((t) => {
      const date = new Date(t.date);
      return date >= from && date <= to;
    })
    .sort((a, b) => a.date - b.date);

  return determineTimeSlots(from, to).map((slot) => {
    const start = slot.start.getTime();
    const end = slot.end.getTime();
    const slotTransactions = filtered.filter(
      (t) => t.date >= start && t.date < end,
    );
    const totals = aggregateTransactions(slotTransactions);
    const balance = calculateBalance(filtered, startBalance, end);

    return {
      date: slot.label,
      actualIncome: totals.processedIncome,
      expectedIncome: totals.expectedIncome,
      actualExpenses: -totals.processedExpenses,
      expectedExpenses: -totals.expectedExpenses,
      balance,
      timestamp: start,
    };
  });
}

export function calculateStartBalance(
  transactions: Doc<"transactions">[] | undefined,
): number {
  if (!transactions) return 0;
  return transactions
    .filter((t) => t.status === "processed")
    .reduce((sum, t) => sum + t.amount, 0);
}

function getTickStep(maxValue: number): number {
  if (maxValue <= 0) return 100;

  const power = Math.floor(Math.log10(maxValue));
  const base = Math.pow(10, power);
  const firstDigit = maxValue / base;

  if (firstDigit <= 2) return base / 2;
  if (firstDigit <= 5) return base;
  return base * 2;
}

function findMaxBarValue(dataPoints: CashflowDataPoint[]): number {
  return dataPoints.reduce((max, point) => {
    const totalIncome = Math.abs(point.actualIncome + point.expectedIncome);
    const totalExpenses = Math.abs(
      point.actualExpenses + point.expectedExpenses,
    );
    return Math.max(max, totalIncome, totalExpenses);
  }, 0);
}

function findBalanceRange(dataPoints: CashflowDataPoint[]): {
  min: number;
  max: number;
} {
  if (dataPoints.length === 0) return { min: 0, max: 0 };

  return dataPoints.reduce(
    (range, point) => ({
      min: Math.min(range.min, point.balance),
      max: Math.max(range.max, point.balance),
    }),
    { min: dataPoints[0].balance, max: dataPoints[0].balance },
  );
}

export function calculateAxisConfig(
  dataPoints: CashflowDataPoint[],
  from: Date,
  to: Date,
) {
  const maxBarValue = findMaxBarValue(dataPoints);
  const balanceRange = findBalanceRange(dataPoints);
  const maxValue = Math.max(
    maxBarValue,
    Math.abs(balanceRange.min),
    Math.abs(balanceRange.max),
  );

  const step = getTickStep(maxValue);
  const roundedMax = Math.ceil(maxValue / step) * step;

  const yAxisTicks: number[] = [];
  for (let tick = -roundedMax; tick <= roundedMax; tick += step) {
    yAxisTicks.push(tick);
  }

  const isLongTimeSlot = isMonthlyRange(from, to);

  let xAxisInterval = 0;
  if (!isLongTimeSlot) {
    const count = dataPoints.length - 1;
    xAxisInterval = Math.max(
      0,
      Math.floor(count / (isWeeklyRange(from, to) ? 12 : 10)),
    );
  }

  return {
    xAxisInterval,
    yAxisTicks,
    roundedMaxBarValue: roundedMax,
    maxBarValue,
    isLongTimeSlot,
    isManyDataPoints: dataPoints.length > 31,
  };
}

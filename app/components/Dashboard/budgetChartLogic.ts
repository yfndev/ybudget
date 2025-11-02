import {
  eachDayOfInterval,
  eachMonthOfInterval,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { de } from "date-fns/locale";
import type { Doc } from "../../../convex/_generated/dataModel";

export type ChartDataPoint = {
  shortLabel: string;
  date: Date;
  income: number;
  expectedIncome: number;
  expense: number;
  expectedExpense: number;
};

export function generateChartData(
  transactions: Doc<"transactions">[],
  dateRange: { from: Date; to: Date }
): ChartDataPoint[] {
  const isMultipleMonths = !isSameMonth(dateRange.from, dateRange.to);

  if (isMultipleMonths) {
    const months = eachMonthOfInterval({
      start: dateRange.from,
      end: dateRange.to,
    });

    return months.map((monthDate) => {
      const monthStart = startOfMonth(monthDate);
      const monthTransactions = transactions.filter((t) =>
        isSameMonth(new Date(t.date), monthStart)
      );

      const processed = monthTransactions.filter(
        (t) => t.status === "processed"
      );
      const expected = monthTransactions.filter((t) => t.status === "expected");

      return {
        shortLabel: format(monthDate, "MMM", { locale: de }),
        date: monthDate,
        income: processed
          .filter((t) => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0),
        expectedIncome: expected
          .filter((t) => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0),
        expense: processed
          .filter((t) => t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0),
        expectedExpense: expected
          .filter((t) => t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      };
    });
  }

  const days = eachDayOfInterval({
    start: dateRange.from,
    end: dateRange.to,
  });

  return days.map((day) => {
    const dayStart = startOfDay(day);
    const dayTransactions = transactions.filter((t) =>
      isSameDay(new Date(t.date), dayStart)
    );

    const processed = dayTransactions.filter((t) => t.status === "processed");
    const expected = dayTransactions.filter((t) => t.status === "expected");

    return {
      shortLabel: format(day, "d", { locale: de }),
      date: day,
      income: processed
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0),
      expectedIncome: expected
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0),
      expense: processed
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      expectedExpense: expected
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    };
  });
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    const formatted = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 1000000);
    return `${formatted} Mio. €`;
  }
  if (value >= 1000) {
    const formatted = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 1000);
    return `${formatted} k €`;
  }
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}


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
import { DateRange } from "react-day-picker";

export interface Transaction {
  id: string;
  date: number;
  amount: number;
  isExpense: boolean;
}

export interface ChartDataPoint {
  label: string;
  shortLabel: string;
  income: number;
  expense: number;
}

function spansMultipleMonths(dateRange: DateRange): boolean {
  if (!dateRange.from || !dateRange.to) return false;
  return !isSameMonth(dateRange.from, dateRange.to);
}

function aggregateTransactionsByMonth(
  transactions: Transaction[],
  dateRange: DateRange
): ChartDataPoint[] {
  if (!dateRange.from || !dateRange.to) return [];

  const months = eachMonthOfInterval({
    start: dateRange.from,
    end: dateRange.to,
  });

  return months.map((monthDate) => {
    const monthStart = startOfMonth(monthDate);
    
    const monthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return isSameMonth(transactionDate, monthStart);
    });

    const income = monthTransactions
      .filter((t) => !t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter((t) => t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      label: format(monthDate, "MMMM", { locale: de }),
      shortLabel: format(monthDate, "MMM", { locale: de }),
      income,
      expense,
    };
  });
}

function aggregateTransactionsByDay(
  transactions: Transaction[],
  dateRange: DateRange
): ChartDataPoint[] {
  if (!dateRange.from || !dateRange.to) return [];

  const days = eachDayOfInterval({
    start: dateRange.from,
    end: dateRange.to,
  });

  return days.map((day) => {
    const dayStart = startOfDay(day);
    
    const dayTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return isSameDay(transactionDate, dayStart);
    });

    const income = dayTransactions
      .filter((t) => !t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = dayTransactions
      .filter((t) => t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      label: format(day, "d. MMM", { locale: de }),
      shortLabel: format(day, "d", { locale: de }),
      income,
      expense,
    };
  });
}

export function generateChartData(
  transactions: Transaction[],
  dateRange: DateRange
): ChartDataPoint[] {
  if (!dateRange.from || !dateRange.to) return [];

  const isMultipleMonths = spansMultipleMonths(dateRange);

  if (isMultipleMonths) {
    return aggregateTransactionsByMonth(transactions, dateRange);
  }

  return aggregateTransactionsByDay(transactions, dateRange);
}


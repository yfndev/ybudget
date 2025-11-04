"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDateRange } from "@/contexts/DateRangeContext";
import { useQuery } from "convex-helpers/react/cache";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { api } from "../../../convex/_generated/api";
import { formatCurrency, generateChartData } from "./BudgetChartLogic";

const chartConfig = {
  income: { label: "Einnahme", color: "hsl(142 72% 29%)" },
  expectedIncome: { label: "Erwartete Einnahme", color: "hsl(142 72% 29%)" },
  expense: { label: "Ausgabe", color: "hsl(0 84% 60%)" },
  expectedExpense: { label: "Erwartete Ausgabe", color: "hsl(0 84% 60%)" },
} satisfies ChartConfig;

export function BudgetChart() {
  const { selectedDateRange } = useDateRange();
  const transactions = useQuery(
    api.transactions.queries.getTransactionsByDateRange,
    {
      startDate: selectedDateRange.from.getTime(),
      endDate: selectedDateRange.to.getTime(),
    },
  );

  const dateRangeText = `${format(selectedDateRange.from, "d. MMM yyyy", {
    locale: de,
  })} - ${format(selectedDateRange.to, "d. MMM yyyy", { locale: de })}`;

  const chartData = transactions
    ? generateChartData(transactions, selectedDateRange)
    : [];
  const isEmpty =
    chartData.length === 0 ||
    chartData.every(
      (d) =>
        d.income === 0 &&
        d.expectedIncome === 0 &&
        d.expense === 0 &&
        d.expectedExpense === 0,
    );

  return (
    <Card className="flex-[1] h-full flex flex-col">
      <CardHeader>
        <CardTitle>Cashflow</CardTitle>
        <CardDescription>{dateRangeText}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {transactions === undefined ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Daten werden geladen...
          </div>
        ) : isEmpty ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Keine Transaktionen im ausgewählten Zeitraum
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="shortLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatCurrency}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="!gap-2.5 px-3 py-2.5 [&>div]:!gap-2.5"
                    labelFormatter={(value, payload) => {
                      if (!payload || payload.length === 0) return value;
                      const dataPoint = payload[0]?.payload;
                      if (!dataPoint?.date) return value;

                      const date = new Date(dataPoint.date);
                      const weekday = format(date, "EEEE", { locale: de });
                      const dayMonth = format(date, "d. MMMM", { locale: de });
                      return `${weekday}, ${dayMonth}`;
                    }}
                    labelClassName="font-bold"
                    formatter={(value, name, item) => {
                      const formattedNumber = new Intl.NumberFormat("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(value as number);
                      const formattedValue = `${formattedNumber}€`;

                      const itemConfig =
                        chartConfig[name as keyof typeof chartConfig];
                      const indicatorColor =
                        item?.color || itemConfig?.color || "hsl(0 0% 50%)";

                      return (
                        <div className="flex w-full items-center gap-3">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{
                              backgroundColor: indicatorColor,
                            }}
                          />
                          <div className="flex flex-1 items-center justify-between gap-4">
                            <span className="text-muted-foreground">
                              {itemConfig?.label || name}
                            </span>
                            <span className="text-foreground font-mono font-medium tabular-nums">
                              {formattedValue}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Line
                dataKey="income"
                type="monotone"
                stroke="var(--color-income)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="expectedIncome"
                type="monotone"
                stroke="var(--color-expectedIncome)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                dataKey="expense"
                type="monotone"
                stroke="var(--color-expense)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="expectedExpense"
                type="monotone"
                stroke="var(--color-expectedExpense)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

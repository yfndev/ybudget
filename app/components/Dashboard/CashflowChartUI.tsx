"use client";

import {
  calculateAxisConfig,
  calculateStartBalance,
  generateCashflowData,
  type CashflowDataPoint,
} from "@/components/Dashboard/cashflowChartLogic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useDateRange } from "@/contexts/DateRangeContext";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  filterTransactionsBeforeDate,
  filterTransactionsByDateRange,
} from "@/lib/transactionFilters";
import { useQuery } from "convex-helpers/react/cache";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

const chartConfig = {
  actualIncome: {
    label: "Einnahmen",
    color: "#10b981",
  },
  expectedIncome: {
    label: "Geplante Einnahmen",
    color: "#86efac",
  },
  actualExpenses: {
    label: "Ausgaben",
    color: "#ef4444",
  },
  expectedExpenses: {
    label: "Geplante Ausgaben",
    color: "#fb923c",
  },
  balance: {
    label: "Kontostand",
    color: "#4b5563",
  },
} satisfies ChartConfig;

interface CashflowChartUIProps {
  transactions?: Doc<"transactions">[];
}

export function CashflowChartUI({
  transactions: providedTransactions,
}: CashflowChartUIProps) {
  const { selectedDateRange } = useDateRange();

  // Only fetch all transactions if not provided (for standalone usage)
  const allTransactionsQuery = useQuery(
    api.transactions.queries.getAllTransactions,
    providedTransactions ? "skip" : {},
  );

  const transactions = useMemo(() => {
    if (providedTransactions) {
      // Use provided transactions (already filtered)
      return providedTransactions;
    }
    return filterTransactionsByDateRange(
      allTransactionsQuery,
      selectedDateRange,
    );
  }, [providedTransactions, allTransactionsQuery, selectedDateRange]);

  const pastTransactions = useMemo(() => {
    const sourceTransactions = providedTransactions || allTransactionsQuery;
    if (!sourceTransactions) return undefined;

    const pastEndDate = new Date(selectedDateRange.from);
    pastEndDate.setDate(pastEndDate.getDate() - 1);
    pastEndDate.setHours(23, 59, 59, 999);

    return filterTransactionsBeforeDate(
      sourceTransactions,
      pastEndDate,
      (t) => t.status === "processed",
    );
  }, [providedTransactions, allTransactionsQuery, selectedDateRange]);

  const startBalance = calculateStartBalance(pastTransactions);

  const dataPoints =
    transactions !== undefined
      ? generateCashflowData(
          transactions,
          startBalance,
          selectedDateRange.from,
          selectedDateRange.to,
        )
      : [];

  const axisConfig = calculateAxisConfig(
    dataPoints,
    selectedDateRange.from,
    selectedDateRange.to,
  );

  const dateRangeText = `${format(selectedDateRange.from, "d. MMM yyyy", {
    locale: de,
  })} - ${format(selectedDateRange.to, "d. MMM yyyy", { locale: de })}`;

  return (
    <Card className="flex flex-col flex-1">
      <CardHeader>
        <CardTitle>Cashflow Übersicht</CardTitle>
        <CardDescription>{dateRangeText}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 overflow-hidden">
        {transactions === undefined ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Daten werden geladen...
          </div>
        ) : dataPoints.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Keine Transaktionen im ausgewählten Zeitraum
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[40vh] w-full">
            <ComposedChart
              data={dataPoints}
              barCategoryGap="0%"
              maxBarSize={50}
              stackOffset="sign"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={axisConfig.xAxisInterval}
                angle={
                  axisConfig.isLongPeriod
                    ? 0
                    : axisConfig.isManyDataPoints
                      ? -45
                      : 0
                }
                textAnchor={
                  axisConfig.isLongPeriod
                    ? "middle"
                    : axisConfig.isManyDataPoints
                      ? "end"
                      : "middle"
                }
                height={
                  axisConfig.isLongPeriod
                    ? 20
                    : axisConfig.isManyDataPoints
                      ? 60
                      : 30
                }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatCurrency}
                domain={[
                  -axisConfig.roundedMaxBarValue,
                  axisConfig.roundedMaxBarValue,
                ]}
                ticks={axisConfig.yAxisTicks}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="!gap-2.5 px-3 py-2.5 [&>div]:!gap-2.5"
                    labelFormatter={(value, payload) => {
                      if (!payload || payload.length === 0) return value;
                      const dataPoint = payload[0]
                        ?.payload as CashflowDataPoint;
                      if (!dataPoint?.timestamp) return value;
                      const date = new Date(dataPoint.timestamp);
                      const weekday = format(date, "EEEE", { locale: de });
                      const dayMonth = format(date, "d. MMMM", { locale: de });
                      return `${weekday}, ${dayMonth}`;
                    }}
                    labelClassName="font-bold"
                    formatter={(value, name, props) => {
                      const numValue = value as number;
                      if (numValue === 0) return null;

                      const formattedNumber = new Intl.NumberFormat("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(Math.abs(numValue));
                      const formattedValue = `${formattedNumber}€`;

                      const itemConfig =
                        chartConfig[name as keyof typeof chartConfig];

                      return (
                        <div className="flex w-full items-center gap-3">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{
                              backgroundColor:
                                itemConfig?.color || "hsl(0 0% 50%)",
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
                    filterNull={true}
                  />
                }
              />
              <ChartLegend
                content={<ChartLegendContent verticalAlign="bottom" />}
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: 8 }}
              />
              <ReferenceLine y={0} stroke="#e5e7eb" strokeWidth={2} />
              <Bar
                dataKey="actualIncome"
                stackId="stack"
                fill="#10b981"
                isAnimationActive={false}
              />
              <Bar
                dataKey="expectedIncome"
                stackId="stack"
                fill="#86efac"
                fillOpacity={0.7}
                isAnimationActive={false}
              />
              <Bar
                dataKey="actualExpenses"
                stackId="stack"
                fill="#ef4444"
                isAnimationActive={false}
              />
              <Bar
                dataKey="expectedExpenses"
                stackId="stack"
                fill="#fb923c"
                fillOpacity={0.7}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#4b5563"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import {
  buildCashflowData,
  calculateAxisConfig,
  calculateStartBalance,
} from "@/components/Dashboard/CashflowChartLogic";

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
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useDateRange } from "@/lib/contexts/DateRangeContext";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import {
  filterTransactionsBeforeDate,
  filterTransactionsByDateRange,
} from "@/lib/calculations/transactionFilters";
import { useQuery } from "convex-helpers/react/cache";
import { format } from "date-fns";
import { de } from "date-fns/locale";
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
  actualIncome: { label: "Einnahmen", color: "#10b981" },
  expectedIncome: { label: "Geplante Einnahmen", color: "#86efac" },
  actualExpenses: { label: "Ausgaben", color: "#ef4444" },
  expectedExpenses: { label: "Geplante Ausgaben", color: "#fb923c" },
  balance: { label: "voraussichtlicher Kontostand", color: "#4b5563" },
} satisfies ChartConfig;

function formatTooltipLabel(_: string, payload: any[]) {
  if (!payload?.[0]?.payload?.timestamp) return "";
  const date = new Date(payload[0].payload.timestamp);
  return `${format(date, "EEEE", { locale: de })}, ${format(date, "d. MMMM", { locale: de })}`;
}

interface CashflowChartUIProps {
  transactions?: Doc<"transactions">[];
}

function getPastEndDate(from: Date) {
  const pastEndDate = new Date(from);
  pastEndDate.setDate(pastEndDate.getDate() - 1);
  pastEndDate.setHours(23, 59, 59, 999);
  return pastEndDate;
}

export function CashflowChartUI({
  transactions: providedTransactions,
}: CashflowChartUIProps) {
  const { selectedDateRange } = useDateRange();

  const allTransactionsQuery = useQuery(
    api.transactions.queries.getAllTransactions,
    providedTransactions ? "skip" : {},
  );

  const sourceTransactions = providedTransactions || allTransactionsQuery;

  const transactions = providedTransactions
    ? providedTransactions
    : filterTransactionsByDateRange(allTransactionsQuery, selectedDateRange);

  const pastTransactions = sourceTransactions
    ? filterTransactionsBeforeDate(
        sourceTransactions,
        getPastEndDate(selectedDateRange.from),
        (t) => t.status === "processed",
      )
    : undefined;

  const startBalance = calculateStartBalance(pastTransactions);

  const dataPoints = transactions
    ? buildCashflowData(
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

  const dateRangeText = `${format(selectedDateRange.from, "d. MMM yyyy", { locale: de })} - ${format(selectedDateRange.to, "d. MMM yyyy", { locale: de })}`;

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
                  axisConfig.isManyDataPoints && !axisConfig.isLongTimeSlot
                    ? -45
                    : 0
                }
                textAnchor={
                  axisConfig.isManyDataPoints && !axisConfig.isLongTimeSlot
                    ? "end"
                    : "middle"
                }
                height={
                  axisConfig.isManyDataPoints && !axisConfig.isLongTimeSlot
                    ? 60
                    : axisConfig.isLongTimeSlot
                      ? 20
                      : 30
                }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={90}
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
                    labelFormatter={formatTooltipLabel}
                    labelClassName="font-bold"
                    hideIndicator={false}
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

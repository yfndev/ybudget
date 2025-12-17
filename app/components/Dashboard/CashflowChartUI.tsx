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
import {
  filterTransactionsBeforeDate,
  filterTransactionsByDateRange,
} from "@/lib/calculations/transactionFilters";
import { useDateRange } from "@/lib/contexts/DateRangeContext";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { useQuery } from "convex/react";
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

function formatTooltipLabel(
  _: string,
  payload: Array<{ payload?: { timestamp?: number } }>,
) {
  const timestamp = payload?.[0]?.payload?.timestamp;
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return `${format(date, "EEEE", { locale: de })}, ${format(date, "d. MMMM", { locale: de })}`;
}

function getPastEndDate(from: Date): Date {
  const pastEndDate = new Date(from);
  pastEndDate.setDate(pastEndDate.getDate() - 1);
  pastEndDate.setHours(23, 59, 59, 999);
  return pastEndDate;
}

interface Props {
  transactions?: Doc<"transactions">[];
}

export function CashflowChartUI({ transactions: providedTransactions }: Props) {
  const { selectedDateRange } = useDateRange();
  const { from, to } = selectedDateRange;

  const allTransactionsQuery = useQuery(
    api.transactions.queries.getAllTransactions,
    providedTransactions ? "skip" : {},
  );

  const sourceTransactions = providedTransactions || allTransactionsQuery;
  const transactions =
    providedTransactions ||
    filterTransactionsByDateRange(allTransactionsQuery, selectedDateRange);

  const pastTransactions = sourceTransactions
    ? filterTransactionsBeforeDate(
        sourceTransactions,
        getPastEndDate(from),
        (tx) => tx.status === "processed",
      )
    : undefined;

  const startBalance = calculateStartBalance(pastTransactions);
  const dataPoints = transactions
    ? buildCashflowData(transactions, startBalance, from, to)
    : [];
  const axisConfig = calculateAxisConfig(dataPoints, from, to);

  const dateRangeText = `${format(from, "d. MMM yyyy", { locale: de })} - ${format(to, "d. MMM yyyy", { locale: de })}`;

  const showRotatedLabels =
    axisConfig.isManyDataPoints && !axisConfig.isLongTimeSlot;
  const xAxisHeight = showRotatedLabels
    ? 60
    : axisConfig.isLongTimeSlot
      ? 20
      : 30;

  if (transactions === undefined) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="pb-2 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">
            Cashflow Übersicht
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {dateRangeText}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0 overflow-hidden">
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Daten werden geladen...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (dataPoints.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="pb-2 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">
            Cashflow Übersicht
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {dateRangeText}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0 overflow-hidden">
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Keine Transaktionen im ausgewählten Zeitraum
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2 sm:pb-6">
        <CardTitle className="text-base sm:text-lg">
          Cashflow Übersicht
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {dateRangeText}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0 overflow-hidden">
        <ChartContainer
          config={chartConfig}
          className="h-[250px] sm:h-[300px] lg:h-[40vh] w-full"
        >
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
              angle={showRotatedLabels ? -45 : 0}
              textAnchor={showRotatedLabels ? "end" : "middle"}
              height={xAxisHeight}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={70}
              tickFormatter={formatCurrency}
              domain={[
                -axisConfig.roundedMaxBarValue,
                axisConfig.roundedMaxBarValue,
              ]}
              ticks={axisConfig.yAxisTicks}
              tick={{ fontSize: 11 }}
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
      </CardContent>
    </Card>
  );
}

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDateRange } from "@/contexts/DateRangeContext";
import { generateChartData, Transaction } from "@/lib/chartUtils";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { api } from "../../../convex/_generated/api";

const chartConfig = {
  income: { label: "Einnahme", color: "hsl(142 72% 29%)" },
  expense: { label: "Ausgabe", color: "hsl(0 84% 60%)" },
} satisfies ChartConfig;

export function BudgetChart() {
  const { selectedDateRange } = useDateRange();
  const rawTransactions = useQuery(
    api.queries.transactionQueries.getTransactions,
    {
      startDate: selectedDateRange.from.getTime(),
      endDate: selectedDateRange.to.getTime(),
      status: "processed",
    }
  );

  const dateRangeText = `${format(selectedDateRange.from, "d. MMM yyyy", {
    locale: de,
  })} - ${format(selectedDateRange.to, "d. MMM yyyy", { locale: de })}`;

  const transactions: Transaction[] =
    rawTransactions?.map((t) => ({
      id: t._id,
      date: t.date,
      amount: t.amount,
    })) ?? [];

  const chartData = generateChartData(transactions, selectedDateRange);
  const isEmpty = transactions.length === 0;

  return (
    <Card className="flex-[3] h-full flex flex-col">
      <CardHeader>
        <CardTitle>Einnahmen vs Ausgaben (ohne Planungen)</CardTitle>
        <CardDescription>{dateRangeText}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {rawTransactions === undefined ? (
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
                tickFormatter={(value) =>
                  value >= 1000 ? `€${(value / 1000).toFixed(1)}k` : `€${value}`
                }
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="income"
                type="monotone"
                stroke="var(--color-income)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="expense"
                type="monotone"
                stroke="var(--color-expense)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

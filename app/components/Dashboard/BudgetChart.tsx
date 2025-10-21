"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

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

const chartConfig = {
  income: {
    label: "Einnahme",
    color: "hsl(142 72% 29%)",
  },
  expense: {
    label: "Ausgabe",
    color: "hsl(0 84% 60%)",
  },
} satisfies ChartConfig;

export function BudgetChart() {
  const { selectedDateRange } = useDateRange();

  const dateRangeText =
    selectedDateRange.from && selectedDateRange.to
      ? `${format(selectedDateRange.from, "d. MMM yyyy", {
          locale: de,
        })} - ${format(selectedDateRange.to, "d. MMM yyyy", { locale: de })}`
      : "Zeitraum wählen";

  const transactions: Transaction[] = [];

  const chartData = generateChartData(transactions, selectedDateRange);

  return (
    <Card className="flex-[3] h-full flex flex-col">
      <CardHeader>
        <CardTitle>Einnahmen vs Ausgaben</CardTitle>
        <CardDescription>{dateRangeText}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="shortLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
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
      </CardContent>
    </Card>
  );
}

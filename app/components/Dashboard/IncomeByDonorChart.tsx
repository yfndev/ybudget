"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useDateRange } from "@/lib/contexts/DateRangeContext";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import {
  filterTransactionsByDateRange,
  type EnrichedTransaction,
} from "@/lib/calculations/transactionFilters";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

function aggregateByDonor(transactions: EnrichedTransaction[]) {
  const byDonor = new Map<string, number>();

  for (const t of transactions) {
    if (t.amount <= 0) continue;
    const name = t.donorName ?? "Ohne Förderer";
    byDonor.set(name, (byDonor.get(name) ?? 0) + t.amount);
  }

  return Array.from(byDonor.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

const chartConfig = {
  value: { label: "Einnahmen", color: "var(--chart-1)" },
} satisfies ChartConfig;

interface IncomeByDonorChartProps {
  transactions: EnrichedTransaction[] | undefined;
}

export function IncomeByDonorChart({ transactions }: IncomeByDonorChartProps) {
  const { selectedDateRange } = useDateRange();

  const filtered = filterTransactionsByDateRange(
    transactions,
    selectedDateRange,
  );
  const data = filtered ? aggregateByDonor(filtered) : [];

  const dateRangeText = `${format(selectedDateRange.from, "d. MMM yyyy", { locale: de })} - ${format(selectedDateRange.to, "d. MMM yyyy", { locale: de })}`;

  if (transactions === undefined) {
    return (
      <Card className="flex flex-col flex-1">
        <CardHeader>
          <CardTitle>Einnahmen nach Förderer</CardTitle>
          <CardDescription>{dateRangeText}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Daten werden geladen...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="flex flex-col flex-1">
        <CardHeader>
          <CardTitle>Einnahmen nach Förderer</CardTitle>
          <CardDescription>{dateRangeText}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Keine Einnahmen im ausgewählten Zeitraum
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col flex-1">
      <CardHeader>
        <CardTitle>Einnahmen nach Förderer</CardTitle>
        <CardDescription>{dateRangeText}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" tickFormatter={formatCurrency} />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => (
                    <div className="flex justify-between gap-4 w-full">
                      <span className="text-muted-foreground">
                        {item.payload.name}
                      </span>
                      <span className="font-mono font-medium">
                        {formatCurrency(value as number)}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="value" fill="var(--chart-1)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

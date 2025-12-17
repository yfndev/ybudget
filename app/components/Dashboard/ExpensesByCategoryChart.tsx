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
import {
  filterTransactionsByDateRange,
  type EnrichedTransaction,
} from "@/lib/calculations/transactionFilters";
import { useDateRange } from "@/lib/contexts/DateRangeContext";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Cell, Pie, PieChart } from "recharts";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function aggregateByCategory(transactions: EnrichedTransaction[]) {
  const byCategory = new Map<string, number>();

  for (const tx of transactions) {
    if (tx.amount >= 0) continue;
    const name = tx.categoryName ?? "Nicht kategorisiert";
    byCategory.set(name, (byCategory.get(name) ?? 0) + Math.abs(tx.amount));
  }

  return Array.from(byCategory.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function buildChartConfig(data: Array<{ name: string }>): ChartConfig {
  return Object.fromEntries(
    data.map((item, index) => [
      item.name,
      { label: item.name, color: CHART_COLORS[index % CHART_COLORS.length] },
    ]),
  );
}

interface Props {
  transactions: EnrichedTransaction[] | undefined;
}

export function ExpensesByCategoryChart({ transactions }: Props) {
  const { selectedDateRange } = useDateRange();
  const { from, to } = selectedDateRange;

  const filtered = filterTransactionsByDateRange(
    transactions,
    selectedDateRange,
  );
  const data = filtered ? aggregateByCategory(filtered) : [];
  const chartConfig = buildChartConfig(data);

  const dateRangeText = `${format(from, "d. MMM yyyy", { locale: de })} - ${format(to, "d. MMM yyyy", { locale: de })}`;

  if (transactions === undefined) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="pb-2 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">
            Ausgaben nach Kategorie
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {dateRangeText}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4 h-[200px] sm:h-[250px] lg:h-[300px] flex items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Daten werden geladen...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="pb-2 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">
            Ausgaben nach Kategorie
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {dateRangeText}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4 h-[200px] sm:h-[250px] lg:h-[300px] flex items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Keine Ausgaben im ausgewählten Zeitraum
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2 sm:pb-6">
        <CardTitle className="text-base sm:text-lg">
          Ausgaben nach Kategorie
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {dateRangeText}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer
          config={chartConfig}
          className="h-[200px] sm:h-[250px] lg:h-[300px] w-full"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="name"
                  formatter={(value, name) => (
                    <div className="flex justify-between gap-4 w-full">
                      <span className="text-muted-foreground">{name}</span>
                      <span className="font-mono font-medium">
                        {formatCurrency(value as number)}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="70%"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

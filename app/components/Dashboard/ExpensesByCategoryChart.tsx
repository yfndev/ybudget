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
import { useDateRange } from "@/lib/DateRangeContext";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { formatDate } from "@/lib/formatters/formatDate";
import {
  filterTransactionsByDateRange,
  type EnrichedTransaction,
} from "@/lib/transactionFilters";
import { Cell, Legend, Pie, PieChart } from "recharts";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function aggregateByCategory(transactions: EnrichedTransaction[]) {
  const byCategory = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.amount >= 0) continue;
    if (transaction.status !== "processed") continue;
    if (transaction.transferId) continue;

    const name = transaction.categoryName ?? "Nicht kategorisiert";
    byCategory.set(
      name,
      (byCategory.get(name) ?? 0) + Math.abs(transaction.amount)
    );
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
    ])
  );
}

interface Props {
  transactions: EnrichedTransaction[] | undefined;
}

export function ExpensesByCategoryChart({ transactions }: Props) {
  const { selectedDateRange } = useDateRange();

  const filtered = filterTransactionsByDateRange(
    transactions,
    selectedDateRange
  );
  const data = filtered ? aggregateByCategory(filtered) : [];
  const chartConfig = buildChartConfig(data);

  const dateRangeText = selectedDateRange
    ? `${formatDate(selectedDateRange.from)} - ${formatDate(selectedDateRange.to)}`
    : "Alle Transaktionen";

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
          className="h-[280px] sm:h-[320px] lg:h-[380px] w-full"
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
              cy="40%"
              innerRadius="35%"
              outerRadius="60%"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 24 }}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

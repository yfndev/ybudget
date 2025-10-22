"use client";

import { Cell, Pie, PieChart } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

const chartData = [
  { category: "verpflegung", amount: 450 },
  { category: "location-and-infrastruktur", amount: 320 },
  { category: "honorare-and-personal", amount: 280 },
  { category: "reisekosten", amount: 190 },
  { category: "marketing-and-werbung", amount: 410 },
  { category: "verwaltung", amount: 150 },
  { category: "it-and-digitale-tools", amount: 220 },
  { category: "sonstiges", amount: 180 },
];

const COLORS = [
  "oklch(0.9158 0.0381 242.1292)",
  "oklch(0.865 0.0708 246.1054)",
  "oklch(0.8012 0.1051 248.4529)",
  "oklch(0.7371 0.1412 250.0443)",
  "oklch(0.6403 0.1313 244.6954)",
  "oklch(0.9158 0.0381 242.1292)",
  "oklch(0.865 0.0708 246.1054)",
  "oklch(0.8012 0.1051 248.4529)",
];

const chartConfig = {
  amount: {
    label: "Betrag",
  },
  verpflegung: {
    label: "Verpflegung",
    color: "oklch(0.9158 0.0381 242.1292)",
  },
  "location-and-infrastruktur": {
    label: "Location",
    color: "oklch(0.865 0.0708 246.1054)",
  },
  "honorare-and-personal": {
    label: "Personal",
    color: "oklch(0.8012 0.1051 248.4529)",
  },
  reisekosten: {
    label: "Reisekosten",
    color: "oklch(0.7371 0.1412 250.0443)",
  },
  "marketing-and-werbung": {
    label: "Marketing",
    color: "oklch(0.6403 0.1313 244.6954)",
  },
  verwaltung: {
    label: "Verwaltung",
    color: "oklch(0.9158 0.0381 242.1292)",
  },
  "it-and-digitale-tools": {
    label: "IT & Tools",
    color: "oklch(0.865 0.0708 246.1054)",
  },
  sonstiges: {
    label: "Sonstiges",
    color: "oklch(0.8012 0.1051 248.4529)",
  },
} satisfies ChartConfig;

export function CategoryChart() {
  return (
    <Card className="flex flex-col flex-1 h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Ausgaben nach Kategorie</CardTitle>
        <CardDescription>Verteilung der Budgets</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full max-h-[300px]"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={80}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="category" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

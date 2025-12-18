"use client";

import {
  endOfMonth,
  endOfQuarter,
  endOfYear,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
  subQuarters,
  subYears,
} from "date-fns";
import { useState } from "react";
import type { DateRange as ReactDayPickerDateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface DateRange {
  from: Date;
  to: Date;
}

interface Props {
  selectedDateRange: DateRange | null;
  onDateRangeChange: (dateRange: DateRange | null) => void;
}

export function RangeCalendar({ selectedDateRange, onDateRangeChange }: Props) {
  const today = new Date();
  const [month, setMonth] = useState(today);

  const presets: Array<{
    key: string;
    label: string;
    range: DateRange | null;
  }> = [
    {
      key: "month",
      label: "Monat",
      range: { from: startOfMonth(today), to: endOfMonth(today) },
    },
    {
      key: "lastMonth",
      label: "Letzter Monat",
      range: {
        from: startOfMonth(subMonths(today, 1)),
        to: endOfMonth(subMonths(today, 1)),
      },
    },
    {
      key: "quarter",
      label: "Quartal",
      range: { from: startOfQuarter(today), to: endOfQuarter(today) },
    },
    {
      key: "lastQuarter",
      label: "Letztes Quartal",
      range: {
        from: startOfQuarter(subQuarters(today, 1)),
        to: endOfQuarter(subQuarters(today, 1)),
      },
    },
    {
      key: "year",
      label: "Jahr",
      range: { from: startOfYear(today), to: endOfYear(today) },
    },
    {
      key: "lastYear",
      label: "Letztes Jahr",
      range: {
        from: startOfYear(subYears(today, 1)),
        to: endOfYear(subYears(today, 1)),
      },
    },
    {
      key: "all",
      label: "Alles",
      range: null,
    },
  ];

  const handlePresetClick = (range: DateRange | null) => {
    onDateRangeChange(range);
    if (range) setMonth(range.to);
  };

  return (
    <Card className=" max-w-xs py-4">
      <CardContent className="px-4">
        <Calendar
          mode="range"
          selected={selectedDateRange ?? undefined}
          onSelect={(newDate: ReactDayPickerDateRange | undefined) => {
            if (newDate?.from && newDate?.to) {
              onDateRangeChange({ from: newDate.from, to: newDate.to });
            }
          }}
          month={month}
          onMonthChange={setMonth}
          className="w-full bg-transparent p-0"
        />
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 border-t px-4 pt-4!">
        {presets.map((preset) => (
          <Button
            key={preset.key}
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick(preset.range)}
          >
            {preset.label}
          </Button>
        ))}
      </CardFooter>
    </Card>
  );
}

export default RangeCalendar;

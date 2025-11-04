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

interface RangeCalendarProps {
  selectedDateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

const RangeCalendar = ({
  selectedDateRange,
  onDateRangeChange,
}: RangeCalendarProps) => {
  const today = new Date();
  const [month, setMonth] = useState(today);

  const presetRanges: Record<string, DateRange> = {
    month: { from: startOfMonth(today), to: endOfMonth(today) },
    lastMonth: {
      from: startOfMonth(subMonths(today, 1)),
      to: endOfMonth(subMonths(today, 1)),
    },
    quarter: { from: startOfQuarter(today), to: endOfQuarter(today) },
    lastQuarter: {
      from: startOfQuarter(subQuarters(today, 1)),
      to: endOfQuarter(subQuarters(today, 1)),
    },
    year: { from: startOfYear(today), to: endOfYear(today) },
    lastYear: {
      from: startOfYear(subYears(today, 1)),
      to: endOfYear(subYears(today, 1)),
    },
  };

  const handlePresetClick = (range: DateRange) => {
    onDateRangeChange(range);
    setMonth(range.to);
  };

  return (
    <Card className=" max-w-xs py-4">
      <CardContent className="px-4">
        <Calendar
          mode="range"
          selected={selectedDateRange as ReactDayPickerDateRange}
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
      <CardFooter className="flex flex-wrap gap-2 border-t px-4 !pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePresetClick(presetRanges.month)}
        >
          Monat
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePresetClick(presetRanges.lastMonth)}
        >
          Letzter Monat
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePresetClick(presetRanges.quarter)}
        >
          Quartal
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePresetClick(presetRanges.lastQuarter)}
        >
          Letztes Quartal
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePresetClick(presetRanges.year)}
        >
          Jahr
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePresetClick(presetRanges.lastYear)}
        >
          Letztes Jahr
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RangeCalendar;

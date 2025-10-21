"use client";

import { startOfMonth } from "date-fns";
import { useEffect, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";

import RangeCalendar from "@/components/RangeCalendar";
import { Button } from "@/components/ui/button";

export function RangeCalendarToggle() {
  const [open, setOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative z-10">
      <Button variant="outline" onClick={() => setOpen(!open)}>
        Pick date range
      </Button>
      {open && (
        <div className="absolute left-0 mt-2 z-10">
          <RangeCalendar
            selectedDateRange={selectedDateRange}
            onDateRangeChange={setSelectedDateRange}
          />
        </div>
      )}
    </div>
  );
}

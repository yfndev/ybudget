"use client";

import { useEffect, useRef, useState } from "react";

import RangeCalendar from "@/components/RangeCalendar/RangeCalendar";
import { Button } from "@/components/ui/button";
import { useDateRange } from "@/contexts/DateRangeContext";

export function RangeCalendarToggle() {
  const [open, setOpen] = useState(false);
  const { selectedDateRange, setSelectedDateRange } = useDateRange();
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
    <div ref={containerRef} className="relative z-10" data-onborda-exclude>
      <Button variant="outline" onClick={() => setOpen(!open)}>
        Datumsbereich wählen
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

"use client";

import { startOfMonth } from "date-fns";
import { createContext, ReactNode, useContext, useState } from "react";
import { DateRange } from "react-day-picker";

interface DateRangeContextType {
  selectedDateRange: DateRange;
  setSelectedDateRange: (range: DateRange) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(
  undefined
);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  return (
    <DateRangeContext.Provider
      value={{ selectedDateRange, setSelectedDateRange }}
    >
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }
  return context;
}

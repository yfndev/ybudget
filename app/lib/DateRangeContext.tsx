"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeContextType {
  selectedDateRange: DateRange | null;
  setSelectedDateRange: (range: DateRange | null) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(
  undefined,
);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(
    null,
  );

  const value = useMemo(
    () => ({ selectedDateRange, setSelectedDateRange }),
    [selectedDateRange],
  );

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }
  return context;
}

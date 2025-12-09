"use client";

import { Input } from "@/components/ui/input";
import { forwardRef, useEffect, useState } from "react";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

function formatDisplayDate(iso: string): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return `${day}.${month}.${year}`;
}

function parseToIso(display: string): string {
  const digits = display.replace(/\D/g, "");
  if (digits.length < 8) return "";

  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  const currentYear = new Date().getFullYear();

  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 2000 || y > currentYear)
    return "";

  return `${year}-${month}-${day}`;
}

function formatAsUserTypes(input: string): string {
  const digits = input.replace(/\D/g, "");

  let day = digits.slice(0, 2);
  let month = digits.slice(2, 4);
  let year = digits.slice(4, 8);

  if (day.length === 2 && parseInt(day, 10) > 31) day = "31";
  if (month.length === 2 && parseInt(month, 10) > 12) month = "12";
  if (year.length === 4) {
    const y = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    if (y < 2000) year = "2000";
    if (y > currentYear) year = String(currentYear);
  }

  if (digits.length <= 2) return day;
  if (digits.length <= 4) return `${day}.${month}`;
  return `${day}.${month}.${year}`;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, placeholder = "TT.MM.JJJJ", className, id }, ref) => {
    const [displayValue, setDisplayValue] = useState(() =>
      formatDisplayDate(value),
    );
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatDisplayDate(value));
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const formatted = formatAsUserTypes(raw);
      setDisplayValue(formatted);

      const digits = raw.replace(/\D/g, "");
      if (digits.length === 8) {
        const iso = parseToIso(raw);
        if (iso) onChange(iso);
      } else if (digits.length === 0) {
        onChange("");
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      const iso = parseToIso(displayValue);
      if (iso) {
        setDisplayValue(formatDisplayDate(iso));
        onChange(iso);
      } else if (displayValue && displayValue.replace(/\D/g, "").length > 0) {
        setDisplayValue(formatDisplayDate(value));
      }
    };

    return (
      <Input
        ref={ref}
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        maxLength={10}
      />
    );
  },
);

DateInput.displayName = "DateInput";

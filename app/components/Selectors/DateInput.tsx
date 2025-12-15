"use client";

import { Input } from "@/components/ui/input";
import { forwardRef, useEffect, useState } from "react";
import toast from "react-hot-toast";

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
  const parts = display.split(".");
  if (parts.length !== 3) return "";

  let [dayStr, monthStr, yearStr] = parts;
  if (!dayStr || !monthStr || !yearStr) return "";

  const day = dayStr.padStart(2, "0");
  const month = monthStr.padStart(2, "0");
  let year = yearStr;

  if (yearStr.length === 2) {
    const twoDigit = parseInt(yearStr, 10);
    year = twoDigit <= 50 ? `20${yearStr.padStart(2, "0")}` : `19${yearStr}`;
  }

  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 2000 || y > 2100) return "";

  return `${year}-${month}-${day}`;
}

function formatAsUserTypes(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
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

      if (raw === "") {
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
        toast.error("Ungültiges Datum");
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

"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { forwardRef } from "react";

const sanitizeAmount = (value: string) => value.replace(/[^\d,]/g, "");

export const AmountInput = forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange: (value: string) => void;
    autoFocus?: boolean;
    id?: string;
    onTabPressed?: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  }
>(
  (
    {
      value,
      onChange,
      autoFocus = false,
      id = "amount",
      onTabPressed,
      onKeyDown,
    },
    ref,
  ) => {
    const valueColor = value ? "text-foreground" : "text-muted-foreground";

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Tab" && onTabPressed) {
        e.preventDefault();
        onTabPressed();
      }
      onKeyDown?.(e);
    };

    return (
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText className={valueColor}>€</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          ref={ref}
          id={id}
          className={valueColor}
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          value={value}
          onChange={(e) => onChange(sanitizeAmount(e.target.value))}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupText className={valueColor}>EUR</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    );
  },
);

AmountInput.displayName = "AmountInput";

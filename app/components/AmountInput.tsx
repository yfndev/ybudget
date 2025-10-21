"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "./ui/input-group";

const sanitizeAmount = (value: string) => value.replace(/[^\d,]/g, "");

export function AmountInput({
  value,
  onChange,
  autoFocus = false,
  id = "amount",
}: {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  id?: string;
}) {
  const valueColor = value ? "text-foreground" : "text-muted-foreground";

  return (
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText className={valueColor}>€</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        className={valueColor}
        type="text"
        inputMode="decimal"
        placeholder="0,00"
        value={value}
        onChange={(e) => onChange(sanitizeAmount(e.target.value))}
        autoFocus={autoFocus}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupText className={valueColor}>EUR</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}

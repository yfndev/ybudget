"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

interface Props {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  id?: string;
}

export function AmountInput({
  value,
  onChange,
  autoFocus,
  id = "amount",
}: Props) {
  const textColor = value ? "text-foreground" : "text-muted-foreground";

  return (
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText className={textColor}>€</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        className={textColor}
        type="text"
        inputMode="decimal"
        placeholder="0,00"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d,]/g, ""))}
        autoFocus={autoFocus}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupText className={textColor}>EUR</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}

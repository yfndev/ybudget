"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export function SelectPlannedTransaction({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const transactions: { value: string; label: string }[] = [];

  const selectedLabel = transactions.find((t) => t.value === value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span
            className={cn(
              "font-medium",
              value ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {selectedLabel || "Transaktion suchen..."}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Transaktion suchen..."
            className="h-9 text-muted-foreground"
          />
          <CommandList>
            <CommandEmpty>Keine Transaktionen gefunden</CommandEmpty>
            <CommandGroup>
              {transactions.map((transaction) => (
                <CommandItem
                  key={transaction.value}
                  value={transaction.value}
                  onSelect={() => {
                    onValueChange(
                      transaction.value === value ? "" : transaction.value,
                    );
                    setOpen(false);
                  }}
                >
                  {transaction.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === transaction.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

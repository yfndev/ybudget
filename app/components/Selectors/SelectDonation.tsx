"use client";

import { Badge } from "@/components/ui/badge";
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
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useQuery } from "convex-helpers/react/cache";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";

interface SelectDonationProps {
  projectId: string;
  value: Id<"transactions">[];
  onValueChange: (value: Id<"transactions">[]) => void;
}

export function SelectDonation({
  projectId,
  value,
  onValueChange,
}: SelectDonationProps) {
  const [open, setOpen] = useState(false);

  const availableDonations = useQuery(
    api.donations.queries.getAvailableDonationsForProject,
    projectId ? { projectId } : "skip",
  );

  const selectedDonations =
    availableDonations?.filter((d) => value.includes(d._id)) || [];

  const handleSelect = (donationId: Id<"transactions">) => {
    if (value.includes(donationId)) {
      onValueChange(value.filter((id) => id !== donationId));
    } else {
      onValueChange([...value, donationId]);
    }
    setOpen(false);
  };

  if (!projectId || !availableDonations || availableDonations.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-10 h-auto py-2"
        >
          <div className="flex flex-col items-start gap-1 flex-1">
            {selectedDonations.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedDonations.map((donation) => (
                  <Badge
                    key={donation._id}
                    variant="secondary"
                    className="text-xs"
                  >
                    {donation.counterparty}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onValueChange(
                          value.filter((id) => id !== donation._id),
                        );
                      }}
                      className="ml-1 hover:bg-accent rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground font-medium">
                Spende auswählen...
              </span>
            )}
          </div>
          <ChevronsUpDown className="opacity-50 shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Spende suchen..."
            className="h-9 text-muted-foreground"
          />
          <CommandList>
            <CommandEmpty>Keine Spenden verfügbar</CommandEmpty>
            <CommandGroup>
              {availableDonations.map((donation) => {
                const isSelected = value.includes(donation._id);
                return (
                  <CommandItem
                    key={donation._id}
                    value={donation._id}
                    onSelect={() => handleSelect(donation._id)}
                  >
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {donation.counterparty}
                        </span>
                        <Check
                          className={cn(
                            "ml-2 h-4 w-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>
                          {new Intl.NumberFormat("de-DE", {
                            style: "currency",
                            currency: "EUR",
                          }).format(donation.amount)}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

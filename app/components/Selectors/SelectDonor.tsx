"use client";

import { AddDonorDialog } from "@/components/Dialogs/AddDonorDialog";
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
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { forwardRef, useState } from "react";

interface SelectDonorProps {
  value: string;
  onValueChange: (value: string) => void;
  onTabPressed?: () => void;
  projectId?: Id<"projects">;
}

export const SelectDonor = forwardRef<HTMLButtonElement, SelectDonorProps>(
  function SelectDonor(
    { value, onValueChange, onTabPressed, projectId },
    buttonRef,
  ) {
    const [open, setOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const allDonors = useQuery(
      api.donors.queries.getAllDonors,
      projectId ? "skip" : {},
    );
    const projectDonors = useQuery(
      api.donors.queries.getDonorsByProject,
      projectId ? { projectId } : "skip",
    );

    const donors = projectId ? projectDonors : allDonors;

    const selectedDonor = donors?.find((d) => d._id.toString() === value);
    const displayText = selectedDonor?.name || "Förderer suchen...";

    const handleSelect = (selectedValue: string) => {
      const newValue = selectedValue === value ? "" : selectedValue;
      onValueChange(newValue);
      setOpen(false);
    };

    const handleCreateNew = () => {
      setDialogOpen(true);
      setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < (donors?.length ?? 0) - 1 ? prev + 1 : 0,
          );
        }
        return;
      }

      if (e.key === "ArrowUp" && open) {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : (donors?.length ?? 0) - 1,
        );
        return;
      }

      if (e.key === "Enter" && open && donors?.[highlightedIndex]) {
        e.preventDefault();
        handleSelect(donors[highlightedIndex]._id.toString());
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        if (open) {
          setOpen(false);
          if (onTabPressed) {
            onTabPressed();
          }
        } else {
          setOpen(true);
        }
        return;
      }

      if (e.key === "Enter" && !open && !value) {
        e.preventDefault();
        setOpen(true);
      }
    };

    return (
      <>
        <Popover
          open={open}
          onOpenChange={(newOpen) => {
            setOpen(newOpen);
            if (newOpen) {
              setHighlightedIndex(0);
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              ref={buttonRef}
              variant="ghost"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between bg-muted"
              onKeyDown={handleKeyDown}
            >
              <span
                className={cn(
                  "font-medium",
                  value ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {displayText}
              </span>
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Förderer suchen..."
                className="h-9 text-muted-foreground"
              />
              <CommandList>
                <CommandEmpty>Keine Förderer :(</CommandEmpty>
                <CommandGroup>
                  {donors?.map((donor, idx) => (
                    <CommandItem
                      key={donor._id}
                      value={donor._id.toString()}
                      onSelect={handleSelect}
                      className={cn(idx === highlightedIndex && "bg-accent")}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{donor.name}</span>
                        <span className="text-xs text-muted-foreground ml-2 capitalize">
                          {donor.type}
                        </span>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto",
                          value === donor._id.toString()
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreateNew}
                    className="text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Neuen Förderer erstellen
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <AddDonorDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onDonorCreated={onValueChange}
        />
      </>
    );
  },
);

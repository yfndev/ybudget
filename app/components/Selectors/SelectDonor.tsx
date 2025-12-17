"use client";

import { AddDonorDialog } from "@/components/Dialogs/AddDonorDialog";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { focusNextInput } from "@/lib/selectorHelpers/focusNextInput";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  projectId?: Id<"projects">;
}

export function SelectDonor({ value, onValueChange, projectId }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const allDonors = useQuery(
    api.donors.queries.getAllDonors,
    projectId ? "skip" : {},
  );
  const projectDonors = useQuery(
    api.donors.queries.getDonorsByProject,
    projectId ? { projectId } : "skip",
  );
  const donors = projectId ? projectDonors : allDonors;

  const selected = donors?.find((donor) => donor._id === value);
  const filtered =
    donors?.filter((donor) =>
      donor.name.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => setHighlightedIndex(0), [search]);

  const close = () => {
    setOpen(false);
    setSearch("");
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (id: string) => {
    onValueChange(id === value ? "" : id);
    close();
    setTimeout(() => focusNextInput(inputRef.current), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return close();

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) return setOpen(true);
      setHighlightedIndex((current) => (current + 1) % filtered.length);
      return;
    }

    if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      setHighlightedIndex(
        (current) => (current - 1 + filtered.length) % filtered.length,
      );
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (open && filtered[highlightedIndex])
        return handleSelect(filtered[highlightedIndex]._id);
      if (!open) return setOpen(true);
    }
  };

  return (
    <>
      <div ref={containerRef} className="relative">
        <input
          ref={inputRef}
          className={cn(
            "h-9 w-full rounded-md bg-muted px-3 pr-8 text-sm outline-none",
            open || !selected ? "text-muted-foreground" : "text-foreground",
          )}
          placeholder="Förderer suchen..."
          value={open ? search : (selected?.name ?? "")}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />

        {open && (
          <div className="absolute mt-1 w-full bg-background border rounded-md shadow-lg z-50 max-h-64 overflow-auto">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Keine Förderer gefunden
              </div>
            )}
            {filtered.map((donor, index) => (
              <button
                key={donor._id}
                type="button"
                className={cn(
                  "w-full text-left px-3 py-2 text-sm flex items-center justify-between",
                  index === highlightedIndex && "bg-accent",
                )}
                onClick={() => handleSelect(donor._id)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span>
                  {donor.name}
                  <span className="text-xs text-muted-foreground ml-2 capitalize">
                    {donor.type}
                  </span>
                </span>
                {value === donor._id && <Check className="h-4 w-4" />}
              </button>
            ))}
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-primary flex items-center gap-2 border-t"
              onClick={() => {
                setDialogOpen(true);
                close();
              }}
            >
              <Plus className="h-4 w-4" />
              Neuen Förderer erstellen
            </button>
          </div>
        )}
      </div>

      <AddDonorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onDonorCreated={onValueChange}
      />
    </>
  );
}

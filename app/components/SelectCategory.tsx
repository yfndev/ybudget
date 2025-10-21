"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MOCK_CATEGORY_GROUPS } from "./data/mockCategories";

const categoryGroups = MOCK_CATEGORY_GROUPS;

export function SelectCategory({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);

  const selectedItem = categoryGroups
    .flatMap((group) => group.items)
    .find((item) => item.value === value);

  const filteredGroups = React.useMemo(() => {
    if (!search) return categoryGroups;

    const searchLower = search.toLowerCase();
    return categoryGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.label.toLowerCase().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower) ||
            group.group.toLowerCase().includes(searchLower)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [search]);

  React.useEffect(() => {
    if (!open) {
      setSearch("");
      setIsFocused(false);
      return;
    }
    const idx = categoryGroups.findIndex((g) =>
      g.items.some((i) => i.value === value)
    );
    setActiveIdx(idx >= 0 ? idx : 0);
  }, [open, value]);

  React.useEffect(() => {
    if (activeIdx >= filteredGroups.length && filteredGroups.length > 0) {
      setActiveIdx(0);
    }
  }, [filteredGroups, activeIdx]);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const valueColor = value ? "text-foreground" : "text-muted-foreground";

  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            ref={triggerRef}
            className="relative"
            onClick={() => !open && setOpen(true)}
          >
            {!open ? (
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                <span className="flex flex-col items-start">
                  <span className={cn("font-medium", valueColor)}>
                    {value ? selectedItem?.label : "Kategorie wählen..."}
                  </span>
                  {selectedItem?.description && (
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {selectedItem.description}
                    </span>
                  )}
                </span>
                <ChevronsUpDown className="opacity-50" />
              </Button>
            ) : (
              <div className="flex items-center gap-2 w-full h-10 rounded-md border border-input bg-background shadow-xs px-3 text-sm ring-offset-background">
                <Input
                  ref={inputRef}
                  placeholder={isFocused ? "" : "Kategorie suchen..."}
                  className="h-5 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-medium placeholder:font-normal placeholder:text-muted-foreground text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 shadow-lg border-2"
          align="start"
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          <div className="flex max-h-[480px]">
            {filteredGroups.length === 0 ? (
              <div className="flex-1 py-8 text-center text-sm text-muted-foreground">
                Keine Kategorie gefunden.
              </div>
            ) : (
              <>
                <div className="w-56 border-r overflow-y-auto">
                  <div className="flex flex-col">
                    {filteredGroups.map((group, idx) => (
                      <button
                        key={group.group}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm font-semibold hover:bg-accent transition-colors",
                          idx === activeIdx && "bg-muted"
                        )}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onFocus={() => setActiveIdx(idx)}
                        type="button"
                      >
                        {idx + 1}. {group.group}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-1.5">
                  {filteredGroups[activeIdx]?.items.map((item) => (
                    <button
                      key={item.value}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors",
                        value === item.value && "bg-accent"
                      )}
                      onClick={() => {
                        onValueChange(item.value);
                        setOpen(false);
                      }}
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-normal leading-snug">
                          {item.label}
                        </span>
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            value === item.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground font-light mt-0.5 leading-snug">
                        {item.description}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

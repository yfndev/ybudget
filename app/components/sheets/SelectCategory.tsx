"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { MOCK_CATEGORY_GROUPS } from "../data/mockCategories";

export function SelectCategory({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [activeItemIdx, setActiveItemIdx] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const itemRefs = React.useRef<Map<number, HTMLButtonElement>>(new Map());

  const selectedItem = MOCK_CATEGORY_GROUPS.flatMap((g) => g.items).find(
    (item) => item.value === value
  );

  const filteredGroups = React.useMemo(() => {
    if (!search) return MOCK_CATEGORY_GROUPS;
    const searchLower = search.toLowerCase();
    return MOCK_CATEGORY_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          group.group.toLowerCase().includes(searchLower)
      ),
    })).filter((group) => group.items.length > 0);
  }, [search]);

  const activeItems = filteredGroups[activeIdx]?.items || [];

  React.useEffect(() => {
    if (!open) {
      setSearch("");
      const idx = MOCK_CATEGORY_GROUPS.findIndex((g) =>
        g.items.some((i) => i.value === value)
      );
      setActiveIdx(idx >= 0 ? idx : 0);
      if (idx >= 0) {
        const itemIdx = MOCK_CATEGORY_GROUPS[idx].items.findIndex(
          (i) => i.value === value
        );
        setActiveItemIdx(itemIdx >= 0 ? itemIdx : 0);
      } else {
        setActiveItemIdx(0);
      }
    } else if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, value]);

  React.useEffect(() => {
    const element = itemRefs.current.get(activeItemIdx);
    element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeItemIdx]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveItemIdx((prev) =>
          prev < activeItems.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveItemIdx((prev) =>
          prev > 0 ? prev - 1 : activeItems.length - 1
        );
        break;
      case "ArrowRight":
        e.preventDefault();
        setActiveIdx((prev) =>
          prev < filteredGroups.length - 1 ? prev + 1 : 0
        );
        setActiveItemIdx(0);
        break;
      case "ArrowLeft":
        e.preventDefault();
        setActiveIdx((prev) =>
          prev > 0 ? prev - 1 : filteredGroups.length - 1
        );
        setActiveItemIdx(0);
        break;
      case "Enter":
        e.preventDefault();
        if (activeItems[activeItemIdx]) {
          onValueChange(activeItems[activeItemIdx].value);
          setOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div onClick={() => !open && setOpen(true)}>
          {!open ? (
            <Button variant="outline" className="w-full justify-between">
              <span className="flex flex-col items-start">
                <span
                  className={cn(
                    "font-medium",
                    value ? "text-foreground" : "text-muted-foreground"
                  )}
                >
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
            <div className="flex items-center gap-2 w-full h-10 rounded-md border border-input bg-background shadow-xs px-3 text-sm">
              <Input
                ref={inputRef}
                placeholder="Kategorie suchen..."
                className="h-5 border-0 p-0 focus-visible:ring-0 font-medium placeholder:text-muted-foreground text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 shadow-lg border-2"
        align="start"
        side="bottom"
        sideOffset={4}
        avoidCollisions={false}
        style={{ width: "var(--radix-popover-trigger-width)" }}
        onKeyDown={handleKeyDown}
      >
        <div className="flex max-h-[480px]">
          {filteredGroups.length === 0 ? (
            <div className="flex-1 py-8 text-center text-sm text-muted-foreground">
              Keine Kategorie gefunden.
            </div>
          ) : (
            <>
              <div className="w-56 border-r overflow-y-auto">
                {filteredGroups.map((group, idx) => (
                  <button
                    key={group.group}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm font-semibold hover:bg-accent",
                      idx === activeIdx && "bg-muted"
                    )}
                    onMouseEnter={() => {
                      setActiveIdx(idx);
                      setActiveItemIdx(0);
                    }}
                    type="button"
                  >
                    {idx + 1}. {group.group}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-1.5">
                {activeItems.map((item, itemIdx) => (
                  <button
                    key={item.value}
                    ref={(el) => {
                      if (el) itemRefs.current.set(itemIdx, el);
                      else itemRefs.current.delete(itemIdx);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md hover:bg-accent",
                      (itemIdx === activeItemIdx || value === item.value) &&
                        "bg-accent"
                    )}
                    onClick={() => {
                      onValueChange(item.value);
                      setOpen(false);
                    }}
                    onMouseEnter={() => setActiveItemIdx(itemIdx)}
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
  );
}

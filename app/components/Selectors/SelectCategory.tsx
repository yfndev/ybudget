"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { filterGroups, findGroupIndex, findItemIndex, groupCategories } from "@/lib/categoryHelpers";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";

interface SelectCategoryProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  onTabPressed?: () => void;
}

export const SelectCategory = forwardRef<HTMLInputElement, SelectCategoryProps>(
  function SelectCategory({ value, onValueChange, onTabPressed }, ref) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeGroupIdx, setActiveGroupIdx] = useState(0);
    const [activeItemIdx, setActiveItemIdx] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const categories = useQuery(api.categories.functions.getAllCategories);
    const selectedItem = categories?.find((cat) => cat._id === value);
    const grouped = categories ? groupCategories(categories) : [];
    const filtered = filterGroups(grouped, search);
    const activeItems = filtered[activeGroupIdx]?.children ?? [];

    useEffect(() => {
      if (!open) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
          setSearch("");
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    useEffect(() => {
      if (search && filtered.length > 0) {
        setActiveGroupIdx(0);
        setActiveItemIdx(0);
      }
    }, [search, filtered.length]);

    const close = () => {
      setOpen(false);
      setSearch("");
    };

    const handleOpen = () => {
      setOpen(true);
      const groupIdx = findGroupIndex(grouped, value as Id<"categories">);
      setActiveGroupIdx(groupIdx >= 0 ? groupIdx : 0);
      if (groupIdx >= 0) {
        setActiveItemIdx(findItemIndex(grouped[groupIdx], value as Id<"categories">));
      }
    };

    const handleSelect = (id: Id<"categories">) => {
      onValueChange(id);
      close();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") return close();

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!open) return handleOpen();
        setActiveItemIdx((i) => (i < activeItems.length - 1 ? i + 1 : 0));
        return;
      }

      if (e.key === "ArrowUp" && open) {
        e.preventDefault();
        setActiveItemIdx((i) => (i > 0 ? i - 1 : activeItems.length - 1));
        return;
      }

      if (e.key === "ArrowRight" && open) {
        e.preventDefault();
        setActiveGroupIdx((i) => (i < filtered.length - 1 ? i + 1 : 0));
        setActiveItemIdx(0);
        return;
      }

      if (e.key === "ArrowLeft" && open) {
        e.preventDefault();
        setActiveGroupIdx((i) => (i > 0 ? i - 1 : filtered.length - 1));
        setActiveItemIdx(0);
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (open && activeItems[activeItemIdx]) return handleSelect(activeItems[activeItemIdx]._id);
        if (!open) return handleOpen();
      }

      if (e.key === "Tab" && open) {
        e.preventDefault();
        close();
        onTabPressed?.();
      }
    };

    return (
      <div ref={containerRef} className="relative">
        <input
          ref={ref}
          className={cn(
            "h-9 w-full rounded-md bg-muted px-3 pr-8 text-sm outline-none",
            open || !selectedItem ? "text-muted-foreground" : "text-foreground",
          )}
          placeholder="Kategorie suchen..."
          value={open ? search : selectedItem?.name ?? ""}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!open) handleOpen();
          }}
          onFocus={handleOpen}
          onKeyDown={handleKeyDown}
        />
        <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />

        {open && (
          <div className="absolute mt-1 w-[640px] bg-background border rounded-md shadow-lg z-50">
            <div className="flex h-[400px]">
              {filtered.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Search className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm font-medium">Keine Kategorie gefunden</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-56 border-r bg-muted/30 overflow-y-auto">
                    {filtered.map((group, idx) => (
                      <button
                        key={group.parent._id}
                        type="button"
                        className={cn(
                          "w-full text-left px-4 py-3 text-sm font-semibold hover:bg-accent/50",
                          idx === activeGroupIdx && "bg-accent",
                        )}
                        onMouseEnter={() => {
                          setActiveGroupIdx(idx);
                          setActiveItemIdx(0);
                        }}
                      >
                        {idx + 1}. {group.parent.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {activeItems.map((item, idx) => (
                      <button
                        key={item._id}
                        type="button"
                        className={cn(
                          "w-full text-left px-3 py-2 hover:bg-accent",
                          idx === activeItemIdx && "bg-accent",
                          value === item._id && "bg-accent/50",
                          item.taxsphere !== "non-profit" && item.taxsphere !== "purpose-operations" && "bg-red-50",
                        )}
                        onClick={() => handleSelect(item._id)}
                        onMouseEnter={() => setActiveItemIdx(idx)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                          <Check className={cn("h-4 w-4 shrink-0 mt-0.5", value === item._id ? "opacity-100" : "opacity-0")} />
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);

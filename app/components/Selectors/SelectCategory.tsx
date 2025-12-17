"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { focusNextInput } from "@/lib/selectorHelpers/focusNextInput";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Category = NonNullable<
  ReturnType<typeof useQuery<typeof api.categories.functions.getAllCategories>>
>[number];

type CategoryGroup = { parent: Category; children: Category[] };

interface Props {
  value: string | undefined;
  onValueChange: (value: string) => void;
}

export function SelectCategory({ value, onValueChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = useQuery(api.categories.functions.getAllCategories);
  const selected = categories?.find((category) => category._id === value);
  const grouped = categories ? groupCategories(categories) : [];
  const filtered = filterGroups(grouped, search);
  const activeChildren = filtered[activeGroupIndex]?.children ?? [];

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (search && filtered.length > 0) {
      setActiveGroupIndex(0);
      setActiveItemIndex(0);
    }
  }, [search, filtered.length]);

  useEffect(() => {
    if (!open || !value) return;
    const groupIndex = grouped.findIndex(
      (group) =>
        group.parent._id === value ||
        group.children.some((child) => child._id === value),
    );
    if (groupIndex >= 0) {
      setActiveGroupIndex(groupIndex);
      const itemIndex = grouped[groupIndex].children.findIndex(
        (child) => child._id === value,
      );
      if (itemIndex >= 0) setActiveItemIndex(itemIndex);
    }
  }, [open]);

  const close = () => {
    setOpen(false);
    setSearch("");
  };

  const handleSelect = (id: Id<"categories">) => {
    onValueChange(id);
    close();
    setTimeout(() => focusNextInput(inputRef.current), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return close();

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) return setOpen(true);
      setActiveItemIndex((current) => (current + 1) % activeChildren.length);
      return;
    }

    if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      setActiveItemIndex(
        (current) =>
          (current - 1 + activeChildren.length) % activeChildren.length,
      );
      return;
    }

    if (e.key === "ArrowRight" && open) {
      e.preventDefault();
      setActiveGroupIndex((current) => (current + 1) % filtered.length);
      setActiveItemIndex(0);
      return;
    }

    if (e.key === "ArrowLeft" && open) {
      e.preventDefault();
      setActiveGroupIndex(
        (current) => (current - 1 + filtered.length) % filtered.length,
      );
      setActiveItemIndex(0);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (open && activeChildren[activeItemIndex])
        return handleSelect(activeChildren[activeItemIndex]._id);
      if (!open) return setOpen(true);
    }
  };

  const isTaxWarning = (item: Category) =>
    item.taxsphere !== "non-profit" && item.taxsphere !== "purpose-operations";

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        className={cn(
          "h-9 w-full rounded-md bg-muted px-3 pr-8 text-sm outline-none",
          open || !selected ? "text-muted-foreground" : "text-foreground",
        )}
        placeholder="Kategorie suchen..."
        value={open ? search : (selected?.name ?? "")}
        onChange={(e) => {
          setSearch(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />

      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-lg z-50 flex w-max">
          <div className="w-52 shrink-0 border-r bg-muted/30 overflow-y-auto max-h-80">
            {filtered.map((group, index) => (
              <button
                key={group.parent._id}
                type="button"
                className={cn(
                  "w-full text-left px-4 py-3 text-sm font-semibold hover:bg-accent/50",
                  index === activeGroupIndex && "bg-accent",
                )}
                onMouseEnter={() => {
                  setActiveGroupIndex(index);
                  setActiveItemIndex(0);
                }}
              >
                {index + 1}. {group.parent.name}
              </button>
            ))}
          </div>
          <div className="w-56 overflow-y-auto max-h-80">
            {activeChildren.map((item, index) => (
              <button
                key={item._id}
                type="button"
                className={cn(
                  "w-full text-left px-3 py-2 hover:bg-accent",
                  index === activeItemIndex && "bg-accent",
                  value === item._id && "bg-accent/50",
                  isTaxWarning(item) && "bg-red-50",
                )}
                onClick={() => handleSelect(item._id)}
                onMouseEnter={() => setActiveItemIndex(index)}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm wrap-break-word">{item.name}</span>
                  {value === item._id && <Check className="h-4 w-4 shrink-0" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function groupCategories(categories: Category[]): CategoryGroup[] {
  const parents = categories.filter((category) => !category.parentId);
  return parents.map((parent) => ({
    parent,
    children: categories.filter((category) => category.parentId === parent._id),
  }));
}

function filterGroups(
  groups: CategoryGroup[],
  search: string,
): CategoryGroup[] {
  if (!search) return groups;
  const term = search.toLowerCase();
  const matches = (text: string) => text.toLowerCase().includes(term);

  return groups
    .map((group) => ({
      parent: group.parent,
      children: group.children.filter(
        (child) => matches(child.name) || matches(group.parent.name),
      ),
    }))
    .filter((group) => group.children.length > 0 || matches(group.parent.name));
}

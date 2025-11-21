"use client";

import { SelectCategoryUI } from "@/components/Selectors/SelectCategoryUI";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  filterGroups,
  findGroupIndex,
  findItemIndex,
  groupCategories,
} from "@/lib/categoryHelpers";
import { useQuery } from "convex/react";
import { forwardRef, useEffect, useState } from "react";

export const SelectCategory = forwardRef<
  HTMLButtonElement,
  {
    value: string | undefined;
    onValueChange: (value: string) => void;
    onTabPressed?: () => void;
  }
>(function SelectCategory({ value, onValueChange, onTabPressed }, triggerRef) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);
  const [activeItemIdx, setActiveItemIdx] = useState(0);

  const categories = useQuery(api.categories.functions.getAllCategories);
  const selectedItem = categories?.find((cat) => cat._id === value);

  const grouped = categories ? groupCategories(categories) : [];
  const filtered = filterGroups(grouped, search);
  const activeItems = filtered[activeGroupIdx]?.children || [];

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearch("");
    } else {
      const groupIdx = findGroupIndex(
        grouped,
        value as Id<"categories"> | undefined,
      );
      setActiveGroupIdx(groupIdx >= 0 ? groupIdx : 0);
      if (groupIdx >= 0) {
        setActiveItemIdx(
          findItemIndex(
            grouped[groupIdx],
            value as Id<"categories"> | undefined,
          ),
        );
      }
    }
  };

  useEffect(() => {
    if (search && filtered.length > 0) {
      setActiveGroupIdx(0);
      setActiveItemIdx(0);
    }
  }, [search, filtered.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab" || e.key === "Enter") {
      if (!open) {
        e.preventDefault();
        setOpen(true);
      } else {
        e.preventDefault();
        if (e.key === "Enter" && activeItems[activeItemIdx]) {
          onValueChange(activeItems[activeItemIdx]._id);
          setOpen(false);
        } else if (e.key === "Tab" && onTabPressed) {
          setOpen(false);
          onTabPressed();
        }
      }
      return;
    }

    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveItemIdx((prev) =>
        prev < activeItems.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveItemIdx((prev) =>
        prev > 0 ? prev - 1 : activeItems.length - 1,
      );
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setActiveGroupIdx((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      setActiveItemIdx(0);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveGroupIdx((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      setActiveItemIdx(0);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <SelectCategoryUI
      open={open}
      onOpenChange={handleOpenChange}
      value={value as Id<"categories"> | undefined}
      selectedItem={selectedItem}
      search={search}
      onSearchChange={setSearch}
      filteredGroups={filtered}
      activeGroupIdx={activeGroupIdx}
      onActiveGroupChange={setActiveGroupIdx}
      activeItemIdx={activeItemIdx}
      onActiveItemChange={setActiveItemIdx}
      activeItems={activeItems}
      onKeyDown={handleKeyDown}
      onSelect={(id) => {
        onValueChange(id);
        setOpen(false);
      }}
      triggerRef={triggerRef}
    />
  );
});

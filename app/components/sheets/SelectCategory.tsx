"use client";

import {
  filterGroups,
  findGroupIndex,
  findItemIndex,
  groupCategories,
} from "@/lib/categoryHelpers";
import { useQuery } from "convex/react";
import { forwardRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { SelectCategoryUI } from "./SelectCategoryUI";

export const SelectCategory = forwardRef<
  HTMLButtonElement,
  {
    value: Id<"categories"> | undefined;
    onValueChange: (value: Id<"categories">) => void;
    onTabPressed?: () => void;
  }
>(function SelectCategory({ value, onValueChange, onTabPressed }, triggerRef) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);
  const [activeItemIdx, setActiveItemIdx] = useState(0);

  const categories = useQuery(api.categories.queries.getAllCategories);
  const selectedItem = categories?.find((cat) => cat._id === value);

  const grouped = categories ? groupCategories(categories) : [];
  const filtered = filterGroups(grouped, search);
  const activeItems = filtered[activeGroupIdx]?.children || [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      if (!open) {
        e.preventDefault();
        setOpen(true);
      } else {
        e.preventDefault();
        if (onTabPressed) {
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
        prev < activeItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveItemIdx((prev) =>
        prev > 0 ? prev - 1 : activeItems.length - 1
      );
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setActiveGroupIdx((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      setActiveItemIdx(0);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveGroupIdx((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      setActiveItemIdx(0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeItems[activeItemIdx]) {
        onValueChange(activeItems[activeItemIdx]._id);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearch("");
    } else {
      const groupIdx = findGroupIndex(grouped, value);
      setActiveGroupIdx(groupIdx >= 0 ? groupIdx : 0);
      if (groupIdx >= 0) {
        setActiveItemIdx(findItemIndex(grouped[groupIdx], value));
      }
    }
  };

  if (search && filtered.length > 0) {
    setActiveGroupIdx(0);
    setActiveItemIdx(0);
  }

  return (
    <SelectCategoryUI
      open={open}
      onOpenChange={handleOpenChange}
      value={value}
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

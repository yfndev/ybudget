"use client";

import { CreateProjectDialog } from "@/components/Dialogs/CreateProjectDialog";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  onTabPressed?: () => void;
}

export const SelectProject = forwardRef<HTMLInputElement, Props>(
  ({ value, onValueChange, onTabPressed }, ref) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const projects = useQuery(api.projects.queries.getAllProjects);
    const selected = projects?.find((project) => project._id === value);
    const filtered =
      projects?.filter((project) =>
        project.name.toLowerCase().includes(search.toLowerCase())
      ) ?? [];

    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        if (!containerRef.current?.contains(e.target as Node)) {
          close();
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    useEffect(() => setHighlightedIndex(0), [search]);

    const close = () => {
      setOpen(false);
      setSearch("");
    };

    const select = (id: string) => {
      onValueChange(id === value ? "" : id);
      close();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") return close();

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!open) return setOpen(true);
        setHighlightedIndex((idx) => (idx < filtered.length - 1 ? idx + 1 : 0));
        return;
      }

      if (e.key === "ArrowUp" && open) {
        e.preventDefault();
        setHighlightedIndex((idx) => (idx > 0 ? idx - 1 : filtered.length - 1));
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (open && filtered[highlightedIndex])
          return select(filtered[highlightedIndex]._id);
        if (!open) return setOpen(true);
      }

      if (e.key === "Tab" && open) {
        e.preventDefault();
        close();
        onTabPressed?.();
      }
    };

    return (
      <>
        <div ref={containerRef} className="relative">
          <input
            ref={ref}
            className={cn(
              "h-9 w-full rounded-md bg-muted px-3 pr-8 text-sm outline-none",
              open || !selected ? "text-muted-foreground" : "text-foreground"
            )}
            placeholder="Projekt suchen..."
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
                  Keine Projekte gefunden
                </div>
              )}
              {filtered.map((project, idx) => (
                <button
                  key={project._id}
                  type="button"
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm flex items-center justify-between",
                    idx === highlightedIndex && "bg-accent"
                  )}
                  onClick={() => select(project._id)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  {project.name}
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === project._id ? "opacity-100" : "opacity-0"
                    )}
                  />
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
                Neues Projekt erstellen
              </button>
            </div>
          )}
        </div>

        <CreateProjectDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onProjectCreated={onValueChange}
        />
      </>
    );
  }
);

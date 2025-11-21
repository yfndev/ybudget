"use client";

import { CreateProjectDialog } from "@/components/Dialogs/CreateProjectDialog";
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
import { cn } from "@/lib/utils";
import { useQuery } from "convex-helpers/react/cache";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useRef, useState } from "react";

interface SelectProjectProps {
  value: string;
  onValueChange: (value: string) => void;
  onTabPressed?: () => void;
}

export function SelectProject({
  value,
  onValueChange,
  onTabPressed,
}: SelectProjectProps) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const projects = useQuery(api.projects.queries.getAllProjects);

  const selectedProject = projects?.find((p) => p._id === value);
  const displayText = selectedProject?.name || "Projekt suchen...";

  const handleSelect = (selectedValue: string) => {
    const newValue = selectedValue === value ? "" : selectedValue;
    onValueChange(newValue);
    setOpen(false);
  };

  const handleCreateNew = () => {
    setDialogOpen(true);
    setOpen(false);
  };

  const handleProjectCreated = (projectId: string) => {
    onValueChange(projectId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab" || e.key === "Enter") {
      if (!open) {
        e.preventDefault();
        setOpen(true);
      } else {
        e.preventDefault();
        if (e.key === "Enter" && projects && projects[highlightedIndex]) {
          handleSelect(projects[highlightedIndex]._id);
        } else if (e.key === "Tab" && onTabPressed) {
          setOpen(false);
          onTabPressed();
        }
      }
    } else if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === "ArrowDown" && open) {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < (projects?.length ?? 0) ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : (projects?.length ?? 0) - 1,
      );
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setHighlightedIndex(0);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={buttonRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
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
              placeholder="Projekt suchen..."
              className="h-9 text-muted-foreground"
            />
            <CommandList>
              <CommandEmpty>Keine Projekte :(</CommandEmpty>
              <CommandGroup>
                {projects?.map((project, idx) => (
                  <CommandItem
                    key={project._id}
                    value={project._id}
                    onSelect={handleSelect}
                    className={cn(idx === highlightedIndex && "bg-accent")}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    {project.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === project._id ? "opacity-100" : "opacity-0",
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
                  Neues Projekt erstellen
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CreateProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </>
  );
}

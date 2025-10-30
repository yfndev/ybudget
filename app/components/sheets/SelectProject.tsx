"use client";

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
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { CreateProjectSheet } from "./CreateProjectSheet";

interface SelectProjectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function SelectProject({ value, onValueChange }: SelectProjectProps) {
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const projects = useQuery(api.queries.projects.getAllProjects);

  const selectedProject = projects?.find((p) => p._id === value);
  const displayText = selectedProject?.name || "Projekt suchen...";

  const handleSelect = (selectedValue: string) => {
    const newValue = selectedValue === value ? "" : selectedValue;
    onValueChange(newValue);
    setOpen(false);
  };

  const handleCreateNew = () => {
    setSheetOpen(true);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span
              className={cn(
                "font-medium",
                value ? "text-foreground" : "text-muted-foreground"
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
                {projects?.map((project) => (
                  <CommandItem
                    key={project._id}
                    value={project._id}
                    onSelect={handleSelect}
                  >
                    {project.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === project._id ? "opacity-100" : "opacity-0"
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

      <CreateProjectSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}

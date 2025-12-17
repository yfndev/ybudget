"use client";

import { SelectProject } from "@/components/Selectors/SelectProject";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: (projectId: string) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onProjectCreated,
}: Props) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");

  const addProject = useMutation(api.projects.functions.createProject);

  const resetForm = () => {
    setName("");
    setParentId("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    try {
      const projectId = await addProject({
        name: name.trim(),
        parentId: parentId ? (parentId as Id<"projects">) : undefined,
      });

      toast.success("Projekt erstellt!");
      onProjectCreated?.(projectId);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error("Fehler beim Erstellen");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neues Projekt/Department erstellen</DialogTitle>
          <DialogDescription>
            Erstelle ein neues Projekt für deine Organisation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Projektname*</Label>
            <Input
              id="project-name"
              placeholder="Wie soll es heißen?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Department/übergeordnetes Projekt wählen</Label>
            <SelectProject value={parentId} onValueChange={setParentId} />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Projekt erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

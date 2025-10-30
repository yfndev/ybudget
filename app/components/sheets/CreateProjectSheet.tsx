"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../../convex/_generated/api";
import { SelectProject } from "./SelectProject";

interface CreateProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectSheet({
  open,
  onOpenChange,
}: CreateProjectSheetProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");

  const user = useQuery(api.queries.users.getCurrentUserQuery);
  const addProject = useMutation(api.functions.projectMutations.addProject);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.organizationId) {
      toast.error("Keine Organisation gefunden");
      return;
    }

    try {
      await addProject({
        name: name,
        description: description,
        parentId: parentId ? (parentId as any)   : undefined,
        organizationId: user.organizationId,
      });
      toast.success("Projekt erstellt!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Fehler beim Erstellen");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col px-4">
        <SheetHeader>
          <SheetTitle>Neues Projekt erstellen</SheetTitle>
          <SheetDescription>
            Erstelle ein neues Projekt für deine Organisation
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col justify-between"
        >
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Projektname</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. YFN 9.0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreibe dein Projekt..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId">
                Übergeordnetes Projekt (optional)
              </Label>
              <SelectProject value={parentId} onValueChange={setParentId} />
            </div>
          </div>
          <SheetFooter className="pt-6">
            <Button type="submit" className="w-full">
              Projekt erstellen
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

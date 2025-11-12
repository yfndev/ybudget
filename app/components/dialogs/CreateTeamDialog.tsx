"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeamDialog({ open, onOpenChange }: CreateTeamDialogProps) {
  const [name, setName] = useState("");
  const createTeam = useMutation(api.teams.functions.createTeam);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Bitte gib einen Team-Namen ein");
      return;
    }

    try {
      await createTeam({
        name: name.trim(),
      });
      toast.success("Team erfolgreich erstellt");
      onOpenChange(false);
      setName("");
    } catch (error) {
      toast.error("Fehler beim Erstellen des Teams");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neues Team erstellen</DialogTitle>
          <DialogDescription>
            Erstelle ein Team, um Benutzer zu gruppieren und Projekt-Zugriff zu
            verwalten
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Team-Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Marketing, Entwicklung, Finanzen"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Team erstellen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


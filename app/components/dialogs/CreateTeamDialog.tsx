"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeamDialog({
  open,
  onOpenChange,
}: CreateTeamDialogProps) {
  const [name, setName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<Id<"users">>>(
    new Set(),
  );

  const users = useQuery(api.users.queries.listOrganizationUsers);
  const createTeam = useMutation(api.teams.functions.createTeam);
  const addTeamMember = useMutation(api.teams.functions.addTeamMember);

  const handleToggleUser = (userId: Id<"users">) => {
    setSelectedUserIds((prev) => {
      const updated = new Set(prev);
      updated.has(userId) ? updated.delete(userId) : updated.add(userId);
      return updated;
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Bitte gib einen Team-Namen ein");
      return;
    }

    try {
      const teamId = await createTeam({ name: name.trim() });

      await Promise.all(
        Array.from(selectedUserIds).map((userId) =>
          addTeamMember({ teamId, userId, role: "viewer" }),
        ),
      );

      toast.success("Team erfolgreich erstellt");
      onOpenChange(false);
      setName("");
      setSelectedUserIds(new Set());
    } catch {
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
        <div className="space-y-6 py-4">
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

          <div className="space-y-2">
            <label className="text-sm font-medium pb-2">
              Benutzer hinzufügen
              {selectedUserIds.size > 0 && ` (${selectedUserIds.size})`}
            </label>
            {users && users.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {users.map((user) => (
                  <Badge
                    key={user._id}
                    variant={
                      selectedUserIds.has(user._id) ? "default" : "secondary"
                    }
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleToggleUser(user._id)}
                  >
                    {user.name || user.email || "Unbekannter Benutzer"}
                  </Badge>
                ))}
              </div>
            )}
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

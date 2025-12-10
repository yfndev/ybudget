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
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteUserDialog({
  open,
  onOpenChange,
}: InviteUserDialogProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const sendInvitation = useMutation(api.invitations.functions.sendInvitation);

  const handleInvite = async () => {
    try {
      await sendInvitation({ email, name });

      toast.success("Einladung erfolgreich gesendet!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Fehler beim Versenden der Einladung.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Benutzer einladen</DialogTitle>
          <DialogDescription>
            Gib einen Namen und Mail ein, um einen neuen Benutzer zu einladen.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Wenn möchtest du einladen?
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Angela Merkel"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium pb-2">
              E-Mail-Adresse
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="max@mustermann.de"
              />
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleInvite}
            disabled={!name.trim() || !email.trim()}
          >
            Einladung senden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "convex/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../../convex/_generated/api";

interface AddDonorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDonorCreated?: (donorId: string) => void;
}

export const AddDonorDialog = ({
  open,
  onOpenChange,
  onDonorCreated,
}: AddDonorDialogProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"donation" | "sponsoring">("donation");

  const createDonor = useMutation(api.donors.functions.createDonor);

  const resetForm = () => {
    setName("");
    setType("donation");
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    try {
      const donorId = await createDonor({
        name: name.trim(),
        type,
      });
      toast.success("Förderer erstellt!");
      onDonorCreated?.(donorId);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error("Fehler beim Erstellen des Förderers");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neuen Förderer erstellen</DialogTitle>
          <DialogDescription>
            Füge einen neuen Förderer zu deiner Organisation hinzu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="donor-name">Name</Label>
            <Input
              id="donor-name"
              placeholder="z.B. BMW Stiftung"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Art des Förderers</Label>
            <Select value={type} onValueChange={(value: "donation" | "sponsoring") => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="donation">Spende</SelectItem>
                <SelectItem value="sponsoring">Sponsoring</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
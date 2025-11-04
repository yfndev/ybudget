"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMutation } from "convex/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../../convex/_generated/api";

interface CreateDonorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDonorSheet({
  open,
  onOpenChange,
}: CreateDonorSheetProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"donation" | "sponsoring">("donation");

  const addDonor = useMutation(api.donors.functions.createDonor);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name ist erforderlich");
      return;
    }

    try {
      await addDonor({
        name: name.trim(),
        type,
      });
      toast.success("Förderer erstellt!");
      setName("");
      setType("donation");
      onOpenChange(false);
    } catch (error) {
      toast.error("Fehler beim Erstellen");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col px-4">
        <SheetHeader>
          <SheetTitle>Neuen Förderer erstellen</SheetTitle>
          <SheetDescription>
            Erstelle einen neuen Förderer für deine Organisation
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col justify-between"
        >
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Stadt München"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Typ</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as "donation" | "sponsoring")}
              >
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
          <SheetFooter className="pt-6">
            <Button type="submit" className="w-full">
              Förderer erstellen
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

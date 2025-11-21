"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export function CreateCategoryDialog({
  children,
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [taxsphere, setTaxsphere] = useState<
    | "non-profit"
    | "asset-management"
    | "purpose-operations"
    | "commercial-operations"
  >("non-profit");
  const [parentId, setParentId] = useState<Id<"categories"> | undefined>();

  const categories = useQuery(api.categories.functions.getAllCategories);
  const createCategory = useMutation(api.categories.functions.createCategory);

  // Only allow selecting parent categories (no nested subcategories)
  const parentCategories = categories?.filter(
    (category: Doc<"categories">) => !category.parentId,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({
        name,
        description,
        taxsphere,
        parentId,
      });
      onOpenChange(false);
      setName("");
      setDescription("");
      setTaxsphere("non-profit");
      setParentId(undefined);
      toast.success("Kategorie erstellt!");
    } catch (error) {
      toast.error("Fehler beim Erstellen der Kategorie");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Kategorie erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie eine neue Kategorie oder Unterkategorie
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Essen/Catering"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="z.B. Kosten für Speisen und Catering-Service"
              rows={3}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="taxsphere">Steuerbereich</Label>
            <Select
              value={taxsphere}
              onValueChange={(value) =>
                setTaxsphere(
                  value as
                    | "non-profit"
                    | "asset-management"
                    | "purpose-operations"
                    | "commercial-operations",
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="non-profit">Ideeller Bereich</SelectItem>
                <SelectItem value="asset-management">
                  Vermögensverwaltung
                </SelectItem>
                <SelectItem value="purpose-operations">Zweckbetrieb</SelectItem>
                <SelectItem value="commercial-operations">
                  Wirtschaftlicher Geschäftsbetrieb
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="parent">
              Übergeordnete Kategorie{" "}
              <span className="text-muted-foreground font-normal">
                (optional, für Unterkategorien)
              </span>
            </Label>
            <Select
              value={parentId || "none"}
              onValueChange={(value) =>
                setParentId(
                  value === "none" ? undefined : (value as Id<"categories">),
                )
              }
            >
              <SelectTrigger className="text-muted-foreground">
                <SelectValue placeholder="Keine (Hauptkategorie wird erstellt)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-muted-foreground">
                  Keine (Hauptkategorie wird erstellt)
                </SelectItem>
                {parentCategories?.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    <span className="text-foreground">{category.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 ">
            <Button
              type="submit"
              disabled={!name.trim() || !description.trim()}
            >
              Kategorie erstellen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation } from "convex/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export const OnboardingDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [name, setName] = useState("");

  const setupUserOrganization = useMutation(
    api.organizations.functions.setupUserOrganization
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const organizationId = await setupUserOrganization({
        organizationName: name.trim() || undefined,
      });

      if (!organizationId) {
        toast.error("Fehler beim Einrichten der Organisation");
        return;
      }

      toast.success("Willkommen bei YBudget! 🥳");
      onOpenChange(false);
    } catch (error) {
      toast.error("Fehler beim Einrichten");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Willkommen bei YBudget :)</DialogTitle>
            <DialogDescription>
              Lass uns direkt loslegen und deinen Verein einrichten.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 mt-4">
            <Label htmlFor="name-1">Wie heißt dein Verein?</Label>
            <Input
              id="name-1"
              name="name"
              placeholder="Young Founders Network e.V."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <DialogFooter className="mt-8">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Abbrechen
              </Button>
            </DialogClose>
            <Button type="submit">Loslegen</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

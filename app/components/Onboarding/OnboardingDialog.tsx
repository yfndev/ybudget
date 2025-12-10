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
import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import toast from "react-hot-toast";

export const OnboardingDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [name, setName] = useState("");

  const orgCheck = useQuery(api.organizations.queries.getOrganizationByDomain);

  const initializeOrganization = useMutation(
    api.organizations.functions.initializeOrganization,
  );

  const isJoiningExisting = orgCheck?.exists === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await initializeOrganization({
        organizationName: name.trim() || undefined,
      });

      if (!result?.organizationId) {
        toast.error("Fehler beim Einrichten der Organisation");
        return;
      }

      if (result.isNew) {
        toast.success("Willkommen bei YBudget! 🥳");
      } else {
        toast.success("Willkommen im Team! 🥳");
      }
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
            <DialogTitle>
              {isJoiningExisting
                ? "Organisation beitreten"
                : "Willkommen bei YBudget :)"}
            </DialogTitle>
            <DialogDescription>
              {isJoiningExisting
                ? `Du wirst der Organisation "${orgCheck.organizationName}" als Betrachter hinzugefügt. Ein Administrator kann deine Rolle später ändern.`
                : "Lass uns direkt loslegen und deinen Verein einrichten."}
            </DialogDescription>
          </DialogHeader>

          {!isJoiningExisting && (
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
          )}

          <DialogFooter className="mt-8">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Abbrechen
              </Button>
            </DialogClose>
            <Button type="submit">
              {isJoiningExisting ? "Beitreten" : "Loslegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

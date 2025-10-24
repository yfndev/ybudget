import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "convex/react";
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
  const user = useQuery(api.queries.userQueries.getCurrentUser);

  const [name, setName] = useState("");
  const domain = user?.email ? user.email.split("@")[1] : "";
  const addOrganization = useMutation(
    api.functions.organizationMutations.addOrganization
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", { name, domain, user });

    if (!name.trim()) {
      toast.error("Bitte gib einen Namen ein");
      return;
    }

    try {
      console.log("Calling addOrganization...");
      await addOrganization({
        name: name,
        domain: domain,
      });

      toast.success("Verein erstellt. Nice 🥳");
      onOpenChange(false);
    } catch (error) {

      toast.error("Fehler beim Erstellen des Vereins");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              Willkommen bei YBudget, {user?.firstName} :)
            </DialogTitle>
            <DialogDescription>
              Lass uns direkt loslegen und deinen Verein erstellen.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 mt-4">
            <Label htmlFor="name-1">Wie heißt dein Verein?</Label>
            <Input
              id="name-1"
              name="name"
              defaultValue="Young Founders Network e.V."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-sm text-muted-foreground ml-2">{domain}</p>
          </div>
          <DialogFooter className="mt-8">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Abbrechen
              </Button>
            </DialogClose>
            <Button type="submit">Verein erstellen</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

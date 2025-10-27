import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
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
  const domain = user?.email ? user.email.split("@")[1] : "";

  const existingOrg = useQuery(
    api.queries.userQueries.getOrganizationByDomain,
    domain ? { domain } : "skip"
  );

  const [name, setName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const addOrganization = useMutation(
    api.functions.organizationMutations.addOrganization
  );
  const joinOrganization = useMutation(
    api.functions.organizationMutations.joinExistingOrganization
  );

  useEffect(() => {
    if (open && existingOrg !== undefined) {
      setShowCreateForm(!existingOrg);
    }
  }, [open, existingOrg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (showCreateForm) {
      if (!name.trim()) {
        toast.error("Bitte gib einen Namen ein");
        return;
      }

      try {
        await addOrganization({
          name: name,
          domain: domain,
        });
        toast.success("Verein erstellt. Nice 🥳");
        onOpenChange(false);
      } catch (error) {
        toast.error("Fehler beim Erstellen des Vereins");
      }
    } else {
      try {
        await joinOrganization();
        toast.success(`Du bist jetzt Teil von ${existingOrg?.name}!`);
        onOpenChange(false);
      } catch (error) {
        toast.error("Fehler beim Beitreten");
      }
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
              {showCreateForm ? (
                "Lass uns direkt loslegen und deinen Verein erstellen."
              ) : (
                <>
                  Anhand deiner Mail, habe ich eine Organisation gefunden.
                  Möchtest du <strong>{existingOrg?.name}</strong> beitreten?
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {showCreateForm && (
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
          )}

          <DialogFooter className="mt-8">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Abbrechen
              </Button>
            </DialogClose>
            <Button type="submit">
              {showCreateForm ? "Verein erstellen" : "Beitreten"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

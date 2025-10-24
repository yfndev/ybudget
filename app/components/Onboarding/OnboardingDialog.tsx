import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation } from "convex/react";
import { useState } from "react";
import { v4 } from "uuid";
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

const OnboardingDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [name, setName] = useState("");

  const addOrganization = useMutation(
    api.functions.organizationMutations.addOrganization
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addOrganization({
      id: v4(),
      name: name,
    });
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Willkommen bei YBudget!</DialogTitle>
            <DialogDescription>
              Lass uns direkt loslegen und deinen Verein erstellen.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Wie heißt dein Verein?</Label>
              <Input
                id="name-1"
                name="name"
                defaultValue="Young Founders Network e.V."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Abbrechen</Button>
            </DialogClose>
            <Button type="submit">Verein erstellen</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

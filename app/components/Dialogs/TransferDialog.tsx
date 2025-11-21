import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { AmountInput } from "../Selectors/AmountInput";
import { SelectProject } from "../Selectors/SelectProject";

export default function TransferDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [sendingProjectId, setSendingProjectId] =
    useState<Id<"projects"> | null>(null);
  const [receivingProjectId, setReceivingProjectId] =
    useState<Id<"projects"> | null>(null);
  const [amount, setAmount] = useState(0);

  const transferMoney = useMutation(api.transactions.functions.transferMoney);

  const handleSubmit = async () => {
    await transferMoney({
      amount,
      sendingProjectId: sendingProjectId!,
      receivingProjectId: receivingProjectId!,
    });
    toast.success("Geld erfolgreich übertragen");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Geld übertragen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Von Projekt</Label>
            <SelectProject
              value={sendingProjectId?.toString() || ""}
              onValueChange={(value) =>
                setSendingProjectId(value as Id<"projects">)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Zu Projekt</Label>
            <SelectProject
              value={receivingProjectId?.toString() || ""}
              onValueChange={(value) =>
                setReceivingProjectId(value as Id<"projects">)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Betrag</Label>
            <AmountInput
              value={amount.toString()}
              onChange={(value) => setAmount(Number(value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit}>Übertragen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

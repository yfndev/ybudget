import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface RejectReimbursementDialogProps {
  open: boolean;
  note: string;
  onOpenChange: (open: boolean) => void;
  onNoteChange: (note: string) => void;
  onReject: () => void;
}

export function RejectReimbursementDialog({
  open,
  note,
  onOpenChange,
  onNoteChange,
  onReject,
}: RejectReimbursementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Erstattung ablehnen</DialogTitle>
          <DialogDescription>
            Bitte geben Sie einen Grund für die Ablehnung ein. Diese Nachricht
            wird dem Nutzer angezeigt.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Grund für die Ablehnung..."
          rows={4}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={onReject} disabled={!note}>
            Ablehnen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

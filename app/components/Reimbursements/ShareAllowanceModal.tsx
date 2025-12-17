"use client";

import { DateInput } from "@/components/Selectors/DateInput";
import { SelectProject } from "@/components/Selectors/SelectProject";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ShareAllowanceModal({ open, onClose }: Props) {
  const createToken = useMutation(api.volunteerAllowance.functions.createToken);

  const [projectId, setProjectId] = useState<Id<"projects"> | null>(null);
  const [activityDescription, setActivityDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const reset = () => {
    setProjectId(null);
    setActivityDescription("");
    setStartDate("");
    setEndDate("");
    onClose();
  };

  const handleGenerate = async () => {
    if (!projectId) return toast.error("Bitte ein Projekt auswählen");

    setIsGenerating(true);
    try {
      const token = await createToken({
        projectId,
        activityDescription: activityDescription || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      await navigator.clipboard.writeText(`${window.location.origin}/ehrenamtspauschale/${token}`);
      toast.success("Link kopiert");
      reset();
    } catch {
      toast.error("Fehler beim Erstellen des Links");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && reset()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ehrenamtspauschale Link teilen</DialogTitle>
          <DialogDescription>
            Erstelle einen Link zum Ausfüllen der Ehrenamtspauschale.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Projekt</Label>
            <SelectProject
              value={projectId || ""}
              onValueChange={(v) =>
                setProjectId(v ? (v as Id<"projects">) : null)
              }
            />
          </div>

          <div>
            <Label>Tätigkeitsbeschreibung</Label>
            <Textarea
              value={activityDescription}
              onChange={(e) => setActivityDescription(e.target.value)}
              placeholder="z.B. Jugendarbeit, Vorstandstätigkeit"
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Von</Label>
              <DateInput value={startDate} onChange={setStartDate} />
            </div>
            <div>
              <Label>Bis</Label>
              <DateInput value={endDate} onChange={setEndDate} />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            className="w-full"
            disabled={isGenerating || !projectId}
          >
            {isGenerating && <Loader2 className="size-4 animate-spin mr-2" />}
            Link erstellen & kopieren
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

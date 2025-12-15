"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Loader2, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import SignaturePad from "react-signature-canvas";

type Props = {
  onUploadComplete: (storageId: Id<"_storage">) => void;
  storageId?: Id<"_storage">;
  generateUploadUrl?: () => Promise<string>;
};

export function SignatureCanvas({
  onUploadComplete,
  storageId,
  generateUploadUrl: customUploadUrl,
}: Props) {
  const padRef = useRef<SignaturePad>(null);
  const [uploading, setUploading] = useState(false);

  const defaultUploadUrl = useMutation(
    api.reimbursements.functions.generateUploadUrl,
  );
  const generateUploadUrl = customUploadUrl || defaultUploadUrl;
  const previewUrl = useQuery(
    api.reimbursements.queries.getFileUrl,
    storageId ? { storageId } : "skip",
  );

  const handleSave = async () => {
    const pad = padRef.current;
    if (!pad || pad.isEmpty()) {
      toast.error("Bitte unterschreiben");
      return;
    }

    setUploading(true);
    try {
      const dataUrl = pad.getTrimmedCanvas().toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const uploadUrl = await generateUploadUrl();

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/png" },
        body: blob,
      });

      if (!response.ok) throw new Error();

      const { storageId: newStorageId } = await response.json();
      onUploadComplete(newStorageId);
      toast.success("Unterschrift gespeichert");
    } catch {
      toast.error("Speichern fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  };

  if (previewUrl) {
    return (
      <div className="border rounded-lg p-4">
        <img src={previewUrl} alt="Unterschrift" className="max-h-24 mx-auto" />
        <p className="text-sm text-muted-foreground text-center mt-2">
          Unterschrift gespeichert
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="border rounded-lg bg-white">
        <SignaturePad
          ref={padRef}
          minWidth={2}
          maxWidth={4}
          canvasProps={{ className: "w-full h-32" }}
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => padRef.current?.clear()}
        >
          <RotateCcw className="size-4 mr-1" />
          Löschen
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={uploading}
        >
          {uploading && <Loader2 className="size-4 animate-spin mr-1" />}
          Unterschrift speichern
        </Button>
      </div>
    </div>
  );
}

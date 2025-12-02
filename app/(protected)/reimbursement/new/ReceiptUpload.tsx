"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  convertToJPG,
  FileConversionError,
  isValidFileType,
} from "@/lib/fileConversion";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  onUploadComplete: (storageId: Id<"_storage">) => void;
  storageId?: Id<"_storage">;
};

export function ReceiptUpload({ onUploadComplete, storageId }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(
    api.reimbursements.mutations.generateUploadUrl
  );
  const previewUrl = useQuery(
    api.reimbursements.queries.getFileUrl,
    storageId ? { storageId } : "skip"
  );

  const handleFile = async (file: File) => {
    if (!isValidFileType(file)) {
      toast.error("Nur JPG, PNG, HEIC und PDF erlaubt");
      return;
    }

    setIsUploading(true);

    try {
      const convertedFile = await convertToJPG(file);
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": convertedFile.type },
        body: convertedFile,
      });

      if (!result.ok) throw new Error();

      const { storageId } = await result.json();
      onUploadComplete(storageId);
      toast.success("Beleg hochgeladen");
    } catch (error) {
      toast.error(
        error instanceof FileConversionError
          ? error.message
          : "Upload fehlgeschlagen"
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (previewUrl) {
    return (
      <div className="border rounded-lg p-4">
        <img
          src={previewUrl}
          alt="Beleg"
          className="max-h-48 mx-auto rounded"
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition cursor-pointer"
    >
      {isUploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-primary animate-spin" />
          <p className="font-medium">Beleg wird verarbeitet...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="size-8 text-primary" />
          </div>
          <div>
            <p className="font-medium">
              Klicke hier oder ziehe deine Datei herein
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              JPG, PNG, HEIC oder PDF (max. 10 MB)
            </p>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.heic,.pdf"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
}

"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  convertToJPG,
  FileConversionError,
  isValidFileType,
} from "@/lib/files/fileConversion";
import { useMutation, useQuery } from "convex/react";
import { FileText, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  onUploadComplete: (storageId: Id<"_storage">) => void;
  storageId?: Id<"_storage">;
};

export function ReceiptUpload({ onUploadComplete, storageId }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [isPdf, setIsPdf] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(
    api.reimbursements.functions.generateUploadUrl,
  );
  const previewUrl = useQuery(
    api.reimbursements.queries.getFileUrl,
    storageId ? { storageId } : "skip",
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
      setIsPdf(convertedFile.type === "application/pdf");
      onUploadComplete(storageId);
      toast.success("Beleg hochgeladen");
    } catch (error) {
      toast.error(
        error instanceof FileConversionError
          ? error.message
          : "Upload fehlgeschlagen",
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (previewUrl) {
    return (
      <div
        className="border rounded-lg p-4 relative group cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {isPdf ? (
          <div className="flex flex-col items-center py-8">
            <FileText className="size-16 text-primary" />
            <p className="text-sm text-muted-foreground mt-2">PDF hochgeladen</p>
          </div>
        ) : (
          <img
            src={previewUrl}
            alt="Beleg"
            className="max-h-48 mx-auto rounded"
          />
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
          <div className="text-white text-center">
            <Upload className="size-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Klicken zum Ändern</p>
          </div>
        </div>
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
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

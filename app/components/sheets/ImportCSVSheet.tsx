"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { useState } from "react";

export function ImportCSVSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const router = useRouter();

  const processFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) =>
        setCsvData(results.data),
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>CSV-Datei importieren</SheetTitle>
          <SheetDescription>
            Ziehen Sie eine CSV-Datei hierher oder wählen Sie eine Datei aus
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 px-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            className={
              isDragging
                ? "border-2 border-dashed rounded-lg p-12 border-primary bg-primary/5 flex flex-col items-center justify-center cursor-pointer"
                : "border-2 border-dashed rounded-lg p-12 border-muted-foreground/25 hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer"
            }
          >
            <Upload
              className={
                isDragging
                  ? "h-12 w-12 mb-4 text-primary"
                  : "h-12 w-12 mb-4 text-muted-foreground"
              }
            />
            <p className="text-lg font-medium mb-2">CSV-Datei hier ablegen</p>
            <p className="text-sm text-muted-foreground mb-4">oder</p>
            <Button asChild variant="outline">
              <label className="cursor-pointer">
                Datei auswählen
                <input type="file" accept=".csv" className="hidden" />
              </label>
            </Button>
          </div>
        </div>
        {csvData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">CSV Preview</h3>
            <div className="max-h-64 overflow-auto border rounded-md">
              <pre className="p-4 text-xs">
                {JSON.stringify(csvData.slice(0, 5), null, 2)}
              </pre>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Showing first 5 rows of {csvData.length} total rows
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

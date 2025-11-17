"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { mapCSVRow } from "@/lib/bankImportMapping/csvMappers";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import posthog from "posthog-js";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

type ImportSource = "moss" | "sparkasse" | "volksbank";

export function ImportTransactionsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [importSource, setImportSource] = useState<ImportSource | "">("");
  const [isDragging, setIsDragging] = useState(false);

  const allTransactions = useQuery(
    api.transactions.queries.getAllTransactions,
    {},
  );

  const existingIds = useMemo(() => {
    if (!allTransactions) return undefined;
    return allTransactions
      .map((t) => t.importedTransactionId)
      .filter(Boolean) as string[];
  }, [allTransactions]);
  const addTransaction = useMutation(
    api.transactions.functions.createImportedTransaction,
  );

  const handleFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        setCsvData(results.data);
      },
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!importSource || existingIds === undefined) return;

    const existingIdsSet = new Set(existingIds);
    const newTransactions = csvData.filter((row) => {
      const mapped = mapCSVRow(row, importSource);
      return !existingIdsSet.has(mapped.importedTransactionId);
    });

    const skipped = csvData.length - newTransactions.length;
    const toastId = toast.loading(
      `Importiere 0/${newTransactions.length} Transaktionen...`,
    );

    try {
      let processed = 0;
      let inserted = 0;

      for (const row of newTransactions) {
        const mapped = mapCSVRow(row, importSource);
        await addTransaction({
          date: mapped.date,
          amount: mapped.amount,
          description: mapped.description,
          counterparty: mapped.counterparty,
          importedTransactionId: mapped.importedTransactionId,
          importSource: importSource,
          accountName: mapped.accountName,
        });

        processed++;
        inserted++;
        toast.loading(
          `Importiere ${processed}/${newTransactions.length} Transaktionen...`,
          {
            id: toastId,
          },
        );
      }

      posthog.capture("transaction_imported", {
        source: importSource,
        total_transactions: csvData.length,
        new_transactions: inserted,
        skipped_duplicates: skipped,
        timestamp: new Date().toISOString(),
      });

      toast.success(
        `${inserted} neue Transaktionen importiert, ${skipped} Duplikate übersprungen`,
        { id: toastId },
      );
      setCsvData([]);
      setImportSource("");
      onOpenChange(false);
    } catch (error) {
      posthog.captureException(error as Error);
      posthog.capture("import_error", {
        source: importSource,
        total_attempted: csvData.length,
        error_message: error instanceof Error ? error.message : "Unknown error",
      });
      toast.error("Fehler beim Importieren", { id: toastId });
    }
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

        {csvData.length === 0 ? (
          <div className="mt-8 px-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <Upload
                className={`h-12 w-12 mb-4 ${
                  isDragging ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <p className="text-lg font-medium mb-2">CSV-Datei hier ablegen</p>
              <p className="text-sm text-muted-foreground mb-4">oder</p>
              <Button asChild variant="outline">
                <label className="cursor-pointer">
                  Datei auswählen
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </label>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 px-5">
            <div className="mb-6">
              <Label className="text-base font-medium">
                Datenquelle auswählen
              </Label>
              <Select
                value={importSource}
                onValueChange={(value) =>
                  setImportSource(value as ImportSource)
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Wählen Sie die Datenquelle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moss">Moss</SelectItem>
                  <SelectItem value="sparkasse">
                    Sparkasse (CSV-CAMT V8)
                  </SelectItem>
                  <SelectItem value="volksbank">Volksbank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <h3 className="text-lg font-medium mb-4">CSV Vorschau</h3>
            <div className="max-h-64 overflow-auto border rounded-md mb-4">
              <pre className="p-4 text-xs">
                {JSON.stringify(csvData.slice(0, 5), null, 2)}
              </pre>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Zeige erste 5 Zeilen von {csvData.length} Zeilen
            </p>

            <Button
              onClick={handleImport}
              disabled={!importSource || existingIds === undefined}
              className="w-full"
            >
              Transaktionen importieren
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

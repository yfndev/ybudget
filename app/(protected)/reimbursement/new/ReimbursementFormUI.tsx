import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ReceiptUpload } from "./ReceiptUpload";

type CurrentReceipt = {
  receiptDate: string;
  companyName: string;
  description: string;
  grossAmount: string;
  taxRate: string;
  receiptNumber: string;
  fileStorageId: Id<"_storage"> | undefined;
};

type Props = {
  projects: Doc<"projects">[];
  selectedProjectId: Id<"projects"> | null;
  setSelectedProjectId: (id: Id<"projects"> | null) => void;
  bankDetails: { iban: string; bic: string; accountHolder: string };
  setBankDetails: (details: { iban: string; bic: string; accountHolder: string }) => void;
  editingBank: boolean;
  setEditingBank: () => void;
  currentReceipt: CurrentReceipt;
  setCurrentReceipt: (receipt: CurrentReceipt) => void;
  calculatedNet: number;
  handleAddReceipt: () => void;
  receipts: Omit<Doc<"receipts">, "_id" | "_creationTime">[];
  handleDeleteReceipt: (index: number) => void;
  handleSubmit: () => void;
  reimbursementType: "expense" | "travel";
  setReimbursementType: (type: "expense" | "travel") => void;
};

export function ReimbursementFormUI({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  bankDetails,
  setBankDetails,
  editingBank,
  setEditingBank,
  currentReceipt,
  setCurrentReceipt,
  calculatedNet,
  handleAddReceipt,
  receipts,
  handleDeleteReceipt,
  handleSubmit,
  reimbursementType,
  setReimbursementType,
}: Props) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const totalNet = receipts.reduce((sum, r) => sum + r.netAmount, 0);
  const totalTax7 = receipts
    .filter((r) => r.taxRate === 7)
    .reduce((sum, r) => sum + (r.grossAmount - r.netAmount), 0);
  const totalTax19 = receipts
    .filter((r) => r.taxRate === 19)
    .reduce((sum, r) => sum + (r.grossAmount - r.netAmount), 0);
  const totalGross = receipts.reduce((sum, r) => sum + r.grossAmount, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Neue Erstattung</h1>
        <p className="text-muted-foreground mt-1">
          Wählen Sie den Erstattungstyp und reichen Sie zur Genehmigung ein
        </p>

        <Tabs value={reimbursementType} onValueChange={(value) => setReimbursementType(value as "expense" | "travel")} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">Auslagenerstattung</TabsTrigger>
            <TabsTrigger value="travel">Reisekostenerstattung</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4">
          <Select
            value={selectedProjectId || ""}
            onValueChange={(value) =>
              setSelectedProjectId(value as Id<"projects">)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Wählen Sie ein Projekt" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project._id} value={project._id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Beleg hinzufügen</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Name/Firma *</Label>
            <Input
              value={currentReceipt.companyName}
              onChange={(e) =>
                setCurrentReceipt({
                  ...currentReceipt,
                  companyName: e.target.value,
                })
              }
              placeholder="z.B. Amazon, Deutsche Bahn"
            />
          </div>
          <div>
            <Label>Beleg-Nr. *</Label>
            <Input
              value={currentReceipt.receiptNumber}
              onChange={(e) =>
                setCurrentReceipt({
                  ...currentReceipt,
                  receiptNumber: e.target.value,
                })
              }
              placeholder="z.B. INV-2024-001"
            />
          </div>
        </div>

        <div>
          <Label>Beschreibung</Label>
          <Textarea
            value={currentReceipt.description}
            onChange={(e) =>
              setCurrentReceipt({
                ...currentReceipt,
                description: e.target.value,
              })
            }
            placeholder="z.B. Büromaterial für Q1, Zugfahrt München-Berlin, Hotelübernachtung"
            rows={2}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>Datum *</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !currentReceipt.receiptDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {currentReceipt.receiptDate
                    ? format(
                        new Date(currentReceipt.receiptDate),
                        "dd.MM.yyyy",
                        { locale: de },
                      )
                    : "Datum wählen"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    currentReceipt.receiptDate
                      ? new Date(currentReceipt.receiptDate)
                      : undefined
                  }
                  onSelect={(date) => {
                    setCurrentReceipt({
                      ...currentReceipt,
                      receiptDate: date ? format(date, "yyyy-MM-dd") : "",
                    });
                    setCalendarOpen(false);
                  }}
                  locale={de}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Bruttobetrag (€) *</Label>
            <Input
              type="number"
              step="0.01"
              value={currentReceipt.grossAmount}
              onChange={(e) =>
                setCurrentReceipt({
                  ...currentReceipt,
                  grossAmount: e.target.value,
                })
              }
              placeholder="119,95"
            />
          </div>
          <div>
            <Label>Wie viel MwSt.?</Label>
            <Select
              value={currentReceipt.taxRate}
              onValueChange={(value) =>
                setCurrentReceipt({ ...currentReceipt, taxRate: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="19">19%</SelectItem>
                <SelectItem value="7">7%</SelectItem>
                <SelectItem value="0">0%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-muted-foreground">Nettobetrag (€)</Label>
            <Input
              type="number"
              value={calculatedNet.toFixed(2)}
              disabled
              className="bg-muted/50 font-mono"
            />
          </div>
        </div>

        <div>
          <Label>Beleg hochladen *</Label>
          <ReceiptUpload
            onUploadComplete={(storageId) =>
              setCurrentReceipt({ ...currentReceipt, fileStorageId: storageId })
            }
            storageId={currentReceipt.fileStorageId || undefined}
          />
        </div>

        <Button
          onClick={handleAddReceipt}
          className="w-full"
          variant="outline"
          size="lg"
        >
          <Plus className="size-5 mr-2" />
          Beleg hinzufügen
        </Button>
      </div>

      {receipts.length > 0 && (
        <div className="space-y-8 mt-24">
          <h2 className="text-2xl font-bold">Zusammenfassung</h2>

          <div className="flex items-end gap-4">
            <div
              className="grid gap-4 flex-1"
              style={{ gridTemplateColumns: "1fr 2fr 1fr" }}
            >
              <div>
                <Label className="text-xs text-muted-foreground uppercase">
                  Kontoinhaber
                </Label>
                <Input
                  value={bankDetails.accountHolder}
                  onChange={(e) =>
                    setBankDetails({
                      ...bankDetails,
                      accountHolder: e.target.value,
                    })
                  }
                  disabled={!editingBank}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">
                  IBAN
                </Label>
                <Input
                  value={bankDetails.iban}
                  onChange={(e) =>
                    setBankDetails({ ...bankDetails, iban: e.target.value })
                  }
                  disabled={!editingBank}
                  placeholder="DE89 3704 0044 0532 0130 00"
                  className="font-mono"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">
                  BIC
                </Label>
                <Input
                  value={bankDetails.bic}
                  onChange={(e) =>
                    setBankDetails({ ...bankDetails, bic: e.target.value })
                  }
                  disabled={!editingBank}
                  placeholder="COBADEFFXXX"
                  className="font-mono"
                />
              </div>
            </div>
            <Button
              variant={editingBank ? "default" : "outline"}
              size="sm"
              onClick={setEditingBank}
            >
              {editingBank ? (
                "Speichern"
              ) : (
                <>
                  <Pencil className="size-4 mr-2" />
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {receipts.map((receipt, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 bg-gray-50 border rounded-md"
              >
                <div className="flex items-center gap-8 flex-1">
                  <span className="font-semibold">{receipt.companyName}</span>
                  <span className="text-sm text-muted-foreground">
                    {receipt.description || "Keine Beschreibung"}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">
                    {receipt.grossAmount.toFixed(2)} €
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteReceipt(index)}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Netto gesamt</span>
              <span>{totalNet.toFixed(2)} €</span>
            </div>
            {totalTax7 > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">UST 7% gesamt</span>
                <span>{totalTax7.toFixed(2)} €</span>
              </div>
            )}
            {totalTax19 > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">UST 19% gesamt</span>
                <span>{totalTax19.toFixed(2)} €</span>
              </div>
            )}
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-semibold pt-2">
              <span>Brutto gesamt</span>
              <span>{totalGross.toFixed(2)} €</span>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-14 font-semibold mt-8"
            size="lg"
          >
            Zur Genehmigung einreichen
          </Button>
        </div>
      )}
    </div>
  );
}

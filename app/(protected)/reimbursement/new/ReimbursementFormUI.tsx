import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, Pencil, Plus, Trash2 } from "lucide-react";
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
  setBankDetails: (details: {
    iban: string;
    bic: string;
    accountHolder: string;
  }) => void;
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
  const totalNet = receipts.reduce((sum, r) => sum + r.netAmount, 0);
  const totalGross = receipts.reduce((sum, r) => sum + r.grossAmount, 0);
  const totalTax7 = receipts
    .filter((r) => r.taxRate === 7)
    .reduce((sum, r) => sum + (r.grossAmount - r.netAmount), 0);
  const totalTax19 = receipts
    .filter((r) => r.taxRate === 19)
    .reduce((sum, r) => sum + (r.grossAmount - r.netAmount), 0);

  const update = (fields: Partial<CurrentReceipt>) =>
    setCurrentReceipt({ ...currentReceipt, ...fields });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Neue Erstattung</h1>
        <div className="flex items-center gap-3">
          <Tabs
            value={reimbursementType}
            onValueChange={(v) =>
              setReimbursementType(v as "expense" | "travel")
            }
          >
            <TabsList>
              <TabsTrigger value="expense">Auslagenerstattung</TabsTrigger>
              <TabsTrigger value="travel">Reisekostenerstattung</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select
            value={selectedProjectId || ""}
            onValueChange={(v) => setSelectedProjectId(v as Id<"projects">)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Projekt wählen" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Beleg hinzufügen</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Name/Firma *</Label>
            <Input
              value={currentReceipt.companyName}
              onChange={(e) => update({ companyName: e.target.value })}
              placeholder="z.B. Amazon, Deutsche Bahn"
            />
          </div>
          <div>
            <Label>Beleg-Nr. *</Label>
            <Input
              value={currentReceipt.receiptNumber}
              onChange={(e) => update({ receiptNumber: e.target.value })}
              placeholder="z.B. INV-2024-001"
            />
          </div>
        </div>

        <div>
          <Label>Beschreibung</Label>
          <Textarea
            value={currentReceipt.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="z.B. Büromaterial für Q1"
            rows={2}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>Datum *</Label>
            <Popover>
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
                  onSelect={(date) =>
                    update({
                      receiptDate: date ? format(date, "yyyy-MM-dd") : "",
                    })
                  }
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
              onChange={(e) => update({ grossAmount: e.target.value })}
              placeholder="119,95"
            />
          </div>
          <div>
            <Label>Wie viel MwSt.?</Label>
            <Select
              value={currentReceipt.taxRate}
              onValueChange={(v) => update({ taxRate: v })}
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
            onUploadComplete={(id) => update({ fileStorageId: id })}
            storageId={currentReceipt.fileStorageId}
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
              {editingBank ? "Speichern" : <Pencil className="size-4" />}
            </Button>
          </div>

          <div className="space-y-3">
            {receipts.map((receipt, i) => (
              <div
                key={i}
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
                    onClick={() => handleDeleteReceipt(i)}
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

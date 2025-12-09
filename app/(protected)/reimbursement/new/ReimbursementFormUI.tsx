import { DateInput } from "@/components/Selectors/DateInput";
import { SelectProject } from "@/components/Selectors/SelectProject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { Id } from "@/convex/_generated/dataModel";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { ReceiptUpload } from "./ReceiptUpload";

export type Receipt = {
  receiptNumber: string;
  receiptDate: string;
  companyName: string;
  description: string;
  netAmount: number;
  taxRate: number;
  grossAmount: number;
  fileStorageId: Id<"_storage">;
};

type BankDetails = {
  iban: string;
  bic: string;
  accountHolder: string;
};

type ReceiptDraft = {
  receiptDate: string;
  companyName: string;
  description: string;
  grossAmount: string;
  taxRate: string;
  receiptNumber: string;
  fileStorageId: Id<"_storage"> | undefined;
};

const EMPTY_RECEIPT: ReceiptDraft = {
  receiptDate: "",
  companyName: "",
  description: "",
  grossAmount: "",
  taxRate: "19",
  receiptNumber: "",
  fileStorageId: undefined,
};

const calculateNet = (gross: number, taxRate: number) =>
  gross / (1 + taxRate / 100);

type Props = {
  selectedProjectId: Id<"projects"> | null;
  setSelectedProjectId: (id: Id<"projects"> | null) => void;
  bankDetails: BankDetails;
  setBankDetails: (details: BankDetails) => void;
  editingBank: boolean;
  onBankToggle: () => void;
  receipts: Receipt[];
  setReceipts: (receipts: Receipt[]) => void;
  onSubmit: () => void;
  reimbursementType: "expense" | "travel";
  setReimbursementType: (type: "expense" | "travel") => void;
};

export function ReimbursementFormUI({
  selectedProjectId,
  setSelectedProjectId,
  bankDetails,
  setBankDetails,
  editingBank,
  onBankToggle,
  receipts,
  setReceipts,
  onSubmit,
  reimbursementType,
  setReimbursementType,
}: Props) {
  const [draft, setDraft] = useState<ReceiptDraft>(EMPTY_RECEIPT);

  const calculatedNet = draft.grossAmount
    ? calculateNet(parseFloat(draft.grossAmount), parseFloat(draft.taxRate))
    : 0;

  const totalNet = receipts.reduce(
    (sum, receipt) => sum + receipt.netAmount,
    0,
  );
  const totalGross = receipts.reduce(
    (sum, receipt) => sum + receipt.grossAmount,
    0,
  );
  const totalTax7 = receipts
    .filter((receipt) => receipt.taxRate === 7)
    .reduce(
      (sum, receipt) => sum + (receipt.grossAmount - receipt.netAmount),
      0,
    );
  const totalTax19 = receipts
    .filter((receipt) => receipt.taxRate === 19)
    .reduce(
      (sum, receipt) => sum + (receipt.grossAmount - receipt.netAmount),
      0,
    );

  const updateDraft = (fields: Partial<ReceiptDraft>) =>
    setDraft({ ...draft, ...fields });

  const handleAddReceipt = () => {
    if (
      !draft.receiptNumber ||
      !draft.companyName ||
      !draft.grossAmount ||
      !draft.fileStorageId
    ) {
      toast.error("Bitte Pflichtfelder ausfüllen");
      return;
    }

    const gross = parseFloat(draft.grossAmount);
    const taxRate = parseFloat(draft.taxRate);

    setReceipts([
      ...receipts,
      {
        receiptNumber: draft.receiptNumber,
        receiptDate: draft.receiptDate,
        companyName: draft.companyName,
        description: draft.description,
        netAmount: calculateNet(gross, taxRate),
        taxRate,
        grossAmount: gross,
        fileStorageId: draft.fileStorageId,
      },
    ]);

    setDraft(EMPTY_RECEIPT);
    toast.success(`Beleg ${receipts.length + 1} hinzugefügt`);
  };

  const handleDeleteReceipt = (index: number) => {
    setReceipts(receipts.filter((_, i) => i !== index));
    toast.success("Beleg entfernt");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <Tabs
          value={reimbursementType}
          onValueChange={(value) =>
            setReimbursementType(value as "expense" | "travel")
          }
        >
          <TabsList>
            <TabsTrigger value="expense">Auslagenerstattung</TabsTrigger>
            <TabsTrigger value="travel">Reisekostenerstattung</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="w-[200px]">
          <SelectProject
            value={selectedProjectId || ""}
            onValueChange={(value) =>
              setSelectedProjectId(value ? (value as Id<"projects">) : null)
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Beleg hinzufügen</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Name/Firma *</Label>
            <Input
              value={draft.companyName}
              onChange={(e) => updateDraft({ companyName: e.target.value })}
              placeholder="z.B. Amazon, Deutsche Bahn"
            />
          </div>
          <div>
            <Label>Beleg-Nr. *</Label>
            <Input
              value={draft.receiptNumber}
              onChange={(e) => updateDraft({ receiptNumber: e.target.value })}
              placeholder="z.B. INV-2024-001"
            />
          </div>
        </div>

        <div>
          <Label>Beschreibung</Label>
          <Textarea
            value={draft.description}
            onChange={(e) => updateDraft({ description: e.target.value })}
            placeholder="z.B. Büromaterial für Q1"
            rows={2}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>Datum *</Label>
            <DateInput
              value={draft.receiptDate}
              onChange={(date) => updateDraft({ receiptDate: date })}
            />
          </div>
          <div>
            <Label>Bruttobetrag (€) *</Label>
            <Input
              type="number"
              step="0.01"
              value={draft.grossAmount}
              onChange={(e) => updateDraft({ grossAmount: e.target.value })}
              placeholder="119,95"
            />
          </div>
          <div>
            <Label>Wie viel MwSt.?</Label>
            <Select
              value={draft.taxRate}
              onValueChange={(value) => updateDraft({ taxRate: value })}
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
            onUploadComplete={(id) => updateDraft({ fileStorageId: id })}
            storageId={draft.fileStorageId}
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
              onClick={onBankToggle}
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
            onClick={onSubmit}
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

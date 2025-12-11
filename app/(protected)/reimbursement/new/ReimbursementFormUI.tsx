"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { ReceiptUpload } from "./ReceiptUpload";

type BankDetails = Pick<
  Doc<"reimbursements">,
  "iban" | "bic" | "accountHolder"
>;
type Receipt = Omit<
  Doc<"receipts">,
  "_id" | "_creationTime" | "reimbursementId" | "costType" | "kilometers"
>;

const calculateNet = (gross: number, taxRate: number) =>
  gross / (1 + taxRate / 100);

export function ReimbursementFormUI({
  defaultBankDetails,
}: {
  defaultBankDetails: BankDetails;
}) {
  const router = useRouter();
  const createReimbursement = useMutation(
    api.reimbursements.functions.createReimbursement,
  );
  const updateUserBankDetails = useMutation(
    api.users.functions.updateBankDetails,
  );

  const [selectedProjectId, setSelectedProjectId] =
    useState<Id<"projects"> | null>(null);
  const [bankDetails, setBankDetails] =
    useState<BankDetails>(defaultBankDetails);
  const [editingBank, setEditingBank] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [draft, setDraft] = useState<Partial<Receipt>>({ taxRate: 19 });

  const calculatedNet = draft.grossAmount
    ? calculateNet(draft.grossAmount, draft.taxRate || 19)
    : 0;

  const totalNet = receipts.reduce((sum, r) => sum + r.netAmount, 0);
  const totalGross = receipts.reduce((sum, r) => sum + r.grossAmount, 0);
  const totalTax7 = receipts
    .filter((r) => r.taxRate === 7)
    .reduce((sum, r) => sum + (r.grossAmount - r.netAmount), 0);
  const totalTax19 = receipts
    .filter((r) => r.taxRate === 19)
    .reduce((sum, r) => sum + (r.grossAmount - r.netAmount), 0);

  const handleBankToggle = async () => {
    if (editingBank) {
      await updateUserBankDetails(bankDetails);
    }
    setEditingBank(!editingBank);
  };

  const handleAddReceipt = () => {
    if (
      !draft.receiptNumber ||
      !draft.companyName ||
      !draft.grossAmount ||
      !draft.fileStorageId ||
      !draft.receiptDate
    ) {
      toast.error("Bitte Pflichtfelder ausfüllen");
      return;
    }
    const taxRate = draft.taxRate || 19;
    setReceipts([
      ...receipts,
      {
        receiptNumber: draft.receiptNumber,
        receiptDate: draft.receiptDate,
        companyName: draft.companyName,
        description: draft.description || "",
        netAmount: calculateNet(draft.grossAmount, taxRate),
        taxRate,
        grossAmount: draft.grossAmount,
        fileStorageId: draft.fileStorageId,
      },
    ]);
    setDraft({ taxRate: 19 });
    toast.success(`Beleg ${receipts.length + 1} hinzugefügt`);
  };

  const handleSubmit = async () => {
    if (!selectedProjectId) {
      toast.error("Bitte ein Projekt auswählen");
      return;
    }
    await createReimbursement({
      projectId: selectedProjectId,
      amount: totalGross,
      ...bankDetails,
      receipts,
    });
    toast.success("Erstattung eingereicht");
    router.push("/reimbursement");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="w-[200px]">
        <SelectProject
          value={selectedProjectId || ""}
          onValueChange={(value) =>
            setSelectedProjectId(value ? (value as Id<"projects">) : null)
          }
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Beleg hinzufügen</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Name/Firma *</Label>
            <Input
              value={draft.companyName || ""}
              onChange={(e) =>
                setDraft({ ...draft, companyName: e.target.value })
              }
              placeholder="z.B. Amazon, Deutsche Bahn"
            />
          </div>
          <div>
            <Label>Beleg-Nr. *</Label>
            <Input
              value={draft.receiptNumber || ""}
              onChange={(e) =>
                setDraft({ ...draft, receiptNumber: e.target.value })
              }
              placeholder="z.B. INV-2024-001"
            />
          </div>
        </div>

        <div>
          <Label>Beschreibung</Label>
          <Textarea
            value={draft.description || ""}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
            placeholder="z.B. Büromaterial für Q1"
            rows={2}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>Datum *</Label>
            <DateInput
              value={draft.receiptDate || ""}
              onChange={(date) => setDraft({ ...draft, receiptDate: date })}
            />
          </div>
          <div>
            <Label>Bruttobetrag (€) *</Label>
            <Input
              type="number"
              step="0.01"
              value={draft.grossAmount || ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  grossAmount: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="119,95"
            />
          </div>
          <div>
            <Label>Wie viel MwSt.?</Label>
            <Select
              value={String(draft.taxRate || 19)}
              onValueChange={(value) =>
                setDraft({ ...draft, taxRate: parseInt(value) })
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
            onUploadComplete={(id) => setDraft({ ...draft, fileStorageId: id })}
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
              onClick={handleBankToggle}
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
                    onClick={() =>
                      setReceipts(receipts.filter((_, j) => j !== i))
                    }
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

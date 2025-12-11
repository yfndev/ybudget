"use client";

import { DateInput } from "@/components/Selectors/DateInput";
import { SelectProject } from "@/components/Selectors/SelectProject";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { ReceiptUpload } from "./ReceiptUpload";

type BankDetails = Pick<
  Doc<"reimbursements">,
  "iban" | "bic" | "accountHolder"
>;
type CostType = NonNullable<Doc<"receipts">["costType"]>;
type TravelReceipt = Omit<
  Doc<"receipts">,
  "_id" | "_creationTime" | "reimbursementId" | "costType"
> & { costType: CostType };
type TravelInfo = Omit<
  Doc<"travelDetails">,
  "_id" | "_creationTime" | "reimbursementId"
>;

const costTypeLabels: Record<CostType, string> = {
  car: "PKW",
  train: "Bahn",
  flight: "Flug",
  taxi: "Taxi",
  bus: "Bus",
  accommodation: "Unterkunft",
};

const costTypePlaceholders: Record<CostType, string> = {
  car: "Eigenfahrt, Miles, Sixt, etc.",
  train: "Deutsche Bahn, Flix, etc.",
  flight: "Lufthansa, Ryanair, etc.",
  taxi: "Uber, Bolt, etc.",
  bus: "Flixbus, etc.",
  accommodation: "Hotel, Airbnb, etc.",
};

const EMPTY_TRAVEL_INFO: TravelInfo = {
  startDate: "",
  endDate: "",
  destination: "",
  purpose: "",
  isInternational: false,
};

export function TravelReimbursementFormUI({
  defaultBankDetails,
}: {
  defaultBankDetails: BankDetails;
}) {
  const router = useRouter();
  const createTravelReimbursement = useMutation(
    api.reimbursements.functions.createTravelReimbursement,
  );
  const updateUserBankDetails = useMutation(
    api.users.functions.updateBankDetails,
  );

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [bankDetails, setBankDetails] =
    useState<BankDetails>(defaultBankDetails);
  const [editingBank, setEditingBank] = useState(false);
  const [travelInfo, setTravelInfo] = useState<TravelInfo>(EMPTY_TRAVEL_INFO);
  const [receipts, setReceipts] = useState<TravelReceipt[]>([]);

  const hasReceipt = (type: CostType) =>
    receipts.some((r) => r.costType === type);

  const toggleType = (type: CostType) => {
    if (hasReceipt(type)) {
      setReceipts(receipts.filter((r) => r.costType !== type));
      return;
    }
    setReceipts([
      ...receipts,
      {
        costType: type,
        receiptNumber: `${type.toUpperCase()}-001`,
        receiptDate: travelInfo.startDate,
        companyName: "",
        description: "",
        netAmount: 0,
        taxRate: 0,
        grossAmount: 0,
        fileStorageId: "" as Id<"_storage">,
        kilometers: type === "car" ? 0 : undefined,
      },
    ]);
  };

  const updateReceipt = (type: CostType, updates: Partial<TravelReceipt>) => {
    setReceipts(
      receipts.map((r) => (r.costType === type ? { ...r, ...updates } : r)),
    );
  };

  const hasBasicInfo =
    travelInfo.destination &&
    travelInfo.purpose &&
    travelInfo.startDate &&
    travelInfo.endDate;
  const receiptsTotal = receipts.reduce((sum, r) => sum + r.grossAmount, 0);
  const mealAllowanceTotal =
    (travelInfo.mealAllowanceDays || 0) *
    (travelInfo.mealAllowanceDailyBudget || 0);
  const totalAmount = receiptsTotal + mealAllowanceTotal;
  const allReceiptsComplete = receipts.every(
    (r) => r.grossAmount > 0 && r.fileStorageId && r.companyName,
  );
  const hasExpenses = receipts.length > 0 || mealAllowanceTotal > 0;
  const canSubmit =
    hasBasicInfo &&
    hasExpenses &&
    (receipts.length === 0 || allReceiptsComplete) &&
    selectedProjectId;

  const handleBankToggle = async () => {
    if (editingBank) {
      await updateUserBankDetails(bankDetails);
    }
    setEditingBank(!editingBank);
  };

  const handleSubmit = async () => {
    if (!selectedProjectId) {
      toast.error("Bitte ein Projekt auswählen");
      return;
    }
    await createTravelReimbursement({
      projectId: selectedProjectId as Id<"projects">,
      amount: totalAmount,
      ...bankDetails,
      ...travelInfo,
      receipts,
    });
    toast.success("Reisekostenerstattung eingereicht");
    router.push("/reimbursement");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="w-[200px]">
        <SelectProject
          value={selectedProjectId}
          onValueChange={setSelectedProjectId}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Reiseangaben</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Reiseziel *</Label>
            <Input
              value={travelInfo.destination}
              onChange={(e) =>
                setTravelInfo({ ...travelInfo, destination: e.target.value })
              }
              placeholder="z.B. München, Berlin"
            />
          </div>
          <div>
            <Label>Reisezweck *</Label>
            <Input
              value={travelInfo.purpose}
              onChange={(e) =>
                setTravelInfo({ ...travelInfo, purpose: e.target.value })
              }
              placeholder="z.B. Kundentermin, Konferenz"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>Reisebeginn *</Label>
            <DateInput
              value={travelInfo.startDate}
              onChange={(date) =>
                setTravelInfo({ ...travelInfo, startDate: date })
              }
            />
          </div>
          <div>
            <Label>Reiseende *</Label>
            <DateInput
              value={travelInfo.endDate}
              onChange={(date) =>
                setTravelInfo({ ...travelInfo, endDate: date })
              }
            />
          </div>
          <div className="col-span-2 flex items-end pb-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="international"
                checked={travelInfo.isInternational}
                onCheckedChange={(checked) =>
                  setTravelInfo({ ...travelInfo, isInternational: !!checked })
                }
              />
              <Label htmlFor="international" className="font-normal">
                Auslandsreise
              </Label>
            </div>
          </div>
        </div>
      </div>

      {hasBasicInfo && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-3">Kostenarten auswählen</h2>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(costTypeLabels) as CostType[]).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={hasReceipt(type) ? "default" : "outline"}
                  onClick={() => toggleType(type)}
                >
                  {costTypeLabels[type]}
                </Button>
              ))}
            </div>
          </div>

          {receipts.map((receipt) => (
            <div
              key={receipt.costType}
              className="border rounded-lg p-4 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium">
                  {receipt.costType === "car"
                    ? "PKW (0,30€/km)"
                    : costTypeLabels[receipt.costType]}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleType(receipt.costType)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Firma/Anbieter *</Label>
                  <Input
                    value={receipt.companyName}
                    onChange={(e) =>
                      updateReceipt(receipt.costType, {
                        companyName: e.target.value,
                      })
                    }
                    placeholder={costTypePlaceholders[receipt.costType]}
                  />
                </div>
                {receipt.costType === "car" ? (
                  <>
                    <div>
                      <Label>Kilometer *</Label>
                      <Input
                        type="number"
                        min={0}
                        value={receipt.kilometers || ""}
                        onChange={(e) => {
                          const km = Math.max(
                            0,
                            Math.floor(parseFloat(e.target.value) || 0),
                          );
                          updateReceipt(receipt.costType, {
                            kilometers: km,
                            grossAmount: Math.round(km * 0.3 * 100) / 100,
                            netAmount: Math.round(km * 0.3 * 100) / 100,
                          });
                        }}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Betrag</Label>
                      <Input
                        value={`${receipt.grossAmount.toFixed(2)} €`}
                        disabled
                        className="bg-muted/50 font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <Label>Betrag (€) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={receipt.grossAmount || ""}
                      onChange={(e) => {
                        const amount = Math.max(
                          0,
                          parseFloat(e.target.value) || 0,
                        );
                        updateReceipt(receipt.costType, {
                          grossAmount: amount,
                          netAmount: amount,
                        });
                      }}
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>

              {receipt.grossAmount > 0 && (
                <div>
                  <Label>Beleg *</Label>
                  <ReceiptUpload
                    onUploadComplete={(id) =>
                      updateReceipt(receipt.costType, { fileStorageId: id })
                    }
                    storageId={receipt.fileStorageId || undefined}
                  />
                </div>
              )}
            </div>
          ))}

          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Verpflegungsmehraufwand</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Tage</Label>
                <Input
                  type="number"
                  step="0.5"
                  min={0}
                  value={travelInfo.mealAllowanceDays || ""}
                  onChange={(e) =>
                    setTravelInfo({
                      ...travelInfo,
                      mealAllowanceDays:
                        parseFloat(e.target.value) || undefined,
                    })
                  }
                  placeholder="z.B. 2.5"
                />
              </div>
              <div>
                <Label>Tagessatz (€)</Label>
                <Select
                  value={travelInfo.mealAllowanceDailyBudget?.toString() || ""}
                  onValueChange={(value) =>
                    setTravelInfo({
                      ...travelInfo,
                      mealAllowanceDailyBudget: parseFloat(value) || undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="14">14 € (8-24h)</SelectItem>
                    <SelectItem value="28">28 € (24h+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground">Betrag</Label>
                <Input
                  value={`${mealAllowanceTotal.toFixed(2)} €`}
                  disabled
                  className="bg-muted/50 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {canSubmit && (
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
            {receipts
              .filter((r) => r.grossAmount > 0)
              .map((receipt) => (
                <div
                  key={receipt.costType}
                  className="flex items-center justify-between px-3 bg-gray-50 border rounded-md"
                >
                  <div className="flex items-center gap-8 flex-1">
                    <span className="font-semibold">
                      {costTypeLabels[receipt.costType]}
                    </span>
                    {receipt.costType === "car" && (
                      <span className="text-sm text-muted-foreground">
                        {receipt.kilometers} km × 0,30€
                      </span>
                    )}
                  </div>
                  <span className="font-semibold">
                    {receipt.grossAmount.toFixed(2)} €
                  </span>
                </div>
              ))}
          </div>

          <div className="space-y-3 pt-6">
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-semibold pt-2">
              <span>Gesamt</span>
              <span>{totalAmount.toFixed(2)} €</span>
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

import { DateInput } from "@/components/Selectors/DateInput";
import { SelectProject } from "@/components/Selectors/SelectProject";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Bus,
  Car,
  Hotel,
  Pencil,
  Plane,
  Train,
  Trash2,
  Utensils,
} from "lucide-react";
import { ReceiptUpload } from "./ReceiptUpload";

export type CostType =
  | "car"
  | "train"
  | "flight"
  | "taxi"
  | "bus"
  | "accommodation"
  | "food";

export type TravelReceipt = {
  receiptNumber: string;
  receiptDate: string;
  companyName: string;
  description: string;
  netAmount: number;
  taxRate: number;
  grossAmount: number;
  fileStorageId: Id<"_storage">;
  costType: CostType;
  kilometers?: number;
};

export type TravelInfo = {
  startDate: string;
  endDate: string;
  destination: string;
  purpose: string;
  isInternational: boolean;
};

type BankDetails = {
  iban: string;
  bic: string;
  accountHolder: string;
};

type Props = {
  selectedProjectId: Id<"projects"> | null;
  setSelectedProjectId: (id: Id<"projects"> | null) => void;
  bankDetails: BankDetails;
  setBankDetails: (details: BankDetails) => void;
  editingBank: boolean;
  onBankToggle: () => void;
  travelInfo: TravelInfo;
  setTravelInfo: (info: TravelInfo) => void;
  receipts: TravelReceipt[];
  setReceipts: (receipts: TravelReceipt[]) => void;
  onSubmit: () => void;
  reimbursementType: "expense" | "travel";
  setReimbursementType: (type: "expense" | "travel") => void;
};

const COST_TYPES = [
  { type: "car" as CostType, label: "PKW", icon: Car },
  { type: "train" as CostType, label: "Bahn", icon: Train },
  { type: "flight" as CostType, label: "Flug", icon: Plane },
  { type: "taxi" as CostType, label: "Taxi", icon: Car },
  { type: "bus" as CostType, label: "Bus", icon: Bus },
  { type: "accommodation" as CostType, label: "Hotel", icon: Hotel },
  { type: "food" as CostType, label: "Essen", icon: Utensils },
];

const getLabel = (type: CostType) =>
  COST_TYPES.find((cost) => cost.type === type)?.label || type;

export function TravelReimbursementFormUI({
  selectedProjectId,
  setSelectedProjectId,
  bankDetails,
  setBankDetails,
  editingBank,
  onBankToggle,
  travelInfo,
  setTravelInfo,
  receipts,
  setReceipts,
  onSubmit,
  reimbursementType,
  setReimbursementType,
}: Props) {
  const hasReceipt = (type: CostType) =>
    receipts.some((receipt) => receipt.costType === type);

  const toggleType = (type: CostType) => {
    if (hasReceipt(type)) {
      setReceipts(receipts.filter((receipt) => receipt.costType !== type));
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
      receipts.map((receipt) =>
        receipt.costType === type ? { ...receipt, ...updates } : receipt,
      ),
    );
  };

  const hasBasicInfo =
    travelInfo.destination &&
    travelInfo.purpose &&
    travelInfo.startDate &&
    travelInfo.endDate;

  const totalAmount = receipts.reduce(
    (sum, receipt) => sum + receipt.grossAmount,
    0,
  );
  const allReceiptsComplete = receipts.every(
    (receipt) =>
      receipt.grossAmount > 0 && receipt.fileStorageId && receipt.companyName,
  );
  const canSubmit =
    hasBasicInfo &&
    receipts.length > 0 &&
    allReceiptsComplete &&
    selectedProjectId;

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
              {COST_TYPES.slice(0, 5).map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  type="button"
                  variant={hasReceipt(type) ? "default" : "outline"}
                  onClick={() => toggleType(type)}
                  className="gap-2"
                >
                  <Icon className="size-4" />
                  {label}
                </Button>
              ))}
              <div className="w-px bg-border mx-2" />
              {COST_TYPES.slice(5).map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  type="button"
                  variant={hasReceipt(type) ? "default" : "outline"}
                  onClick={() => toggleType(type)}
                  className="gap-2"
                >
                  <Icon className="size-4" />
                  {label}
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
                    : getLabel(receipt.costType)}
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
                    placeholder={
                      receipt.costType === "car"
                        ? "Eigenfahrt"
                        : "z.B. Deutsche Bahn"
                    }
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
              onClick={onBankToggle}
            >
              {editingBank ? "Speichern" : <Pencil className="size-4" />}
            </Button>
          </div>

          <div className="space-y-3">
            {receipts
              .filter((receipt) => receipt.grossAmount > 0)
              .map((receipt) => (
                <div
                  key={receipt.costType}
                  className="flex items-center justify-between px-3 bg-gray-50 border rounded-md"
                >
                  <div className="flex items-center gap-8 flex-1">
                    <span className="font-semibold">
                      {getLabel(receipt.costType)}
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

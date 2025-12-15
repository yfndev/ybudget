"use client";

import { BankDetailsEditor } from "@/components/BankDetailsEditor";
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
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { ReceiptUpload } from "./ReceiptUpload";

type BankDetails = { iban: string; bic: string; accountHolder: string };
type CostType = "car" | "train" | "flight" | "taxi" | "bus" | "accommodation";

type Receipt = {
  costType: CostType;
  receiptNumber: string;
  receiptDate: string;
  companyName: string;
  description: string;
  netAmount: number;
  taxRate: number;
  grossAmount: number;
  fileStorageId: Id<"_storage">;
  kilometers?: number;
};

const LABELS: Record<CostType, string> = {
  car: "PKW",
  train: "Bahn",
  flight: "Flug",
  taxi: "Taxi",
  bus: "Bus",
  accommodation: "Unterkunft",
};
const PLACEHOLDERS: Record<CostType, string> = {
  car: "Eigenfahrt, Miles, Sixt, etc.",
  train: "Deutsche Bahn, Flix, etc.",
  flight: "Lufthansa, Ryanair, etc.",
  taxi: "Uber, Bolt, etc.",
  bus: "Flixbus, etc.",
  accommodation: "Hotel, Airbnb, etc.",
};
const COST_TYPES = Object.keys(LABELS) as CostType[];

export function TravelReimbursementFormUI({
  defaultBankDetails,
}: {
  defaultBankDetails: BankDetails;
}) {
  const router = useRouter();
  const submit = useMutation(
    api.reimbursements.functions.createTravelReimbursement,
  );

  const [projectId, setProjectId] = useState<Id<"projects"> | null>(null);
  const [bank, setBank] = useState(defaultBankDetails);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [travel, setTravel] = useState({
    destination: "",
    purpose: "",
    startDate: "",
    endDate: "",
    isInternational: false,
    mealDays: 0,
    mealRate: 0,
  });

  const set = <K extends keyof typeof travel>(
    key: K,
    value: (typeof travel)[K],
  ) => setTravel((t) => ({ ...t, [key]: value }));

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
        receiptDate: travel.startDate,
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

  const updateReceipt = (type: CostType, updates: Partial<Receipt>) =>
    setReceipts(
      receipts.map((r) => (r.costType === type ? { ...r, ...updates } : r)),
    );

  const hasBasicInfo =
    travel.destination && travel.purpose && travel.startDate && travel.endDate;
  const receiptsTotal = receipts.reduce((sum, r) => sum + r.grossAmount, 0);
  const mealTotal = travel.mealDays * travel.mealRate;
  const total = receiptsTotal + mealTotal;
  const allComplete = receipts.every(
    (r) => r.grossAmount > 0 && r.fileStorageId && r.companyName,
  );
  const canSubmit =
    hasBasicInfo &&
    (receipts.length > 0 || mealTotal > 0) &&
    (receipts.length === 0 || allComplete) &&
    projectId;

  const handleSubmit = async () => {
    if (!projectId) return toast.error("Bitte ein Projekt auswählen");
    await submit({
      projectId,
      amount: total,
      ...bank,
      startDate: travel.startDate,
      endDate: travel.endDate,
      destination: travel.destination,
      purpose: travel.purpose,
      isInternational: travel.isInternational,
      mealAllowanceDays: travel.mealDays || undefined,
      mealAllowanceDailyBudget: travel.mealRate || undefined,
      receipts,
    });
    toast.success("Reisekostenerstattung eingereicht");
    router.push("/reimbursement");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="w-[200px]">
        <SelectProject
          value={projectId || ""}
          onValueChange={(v) => setProjectId(v ? (v as Id<"projects">) : null)}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Reiseangaben</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Reiseziel *</Label>
            <Input
              value={travel.destination}
              onChange={(e) => set("destination", e.target.value)}
              placeholder="z.B. München, Berlin"
            />
          </div>
          <div>
            <Label>Reisezweck *</Label>
            <Input
              value={travel.purpose}
              onChange={(e) => set("purpose", e.target.value)}
              placeholder="z.B. Kundentermin, Konferenz"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>Reisebeginn *</Label>
            <DateInput
              value={travel.startDate}
              onChange={(v) => set("startDate", v)}
            />
          </div>
          <div>
            <Label>Reiseende *</Label>
            <DateInput
              value={travel.endDate}
              onChange={(v) => set("endDate", v)}
            />
          </div>
          <div className="col-span-2 flex items-end pb-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="international"
                checked={travel.isInternational}
                onCheckedChange={(c) => set("isInternational", c === true)}
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
              {COST_TYPES.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={hasReceipt(type) ? "default" : "outline"}
                  onClick={() => toggleType(type)}
                >
                  {LABELS[type]}
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
                    : LABELS[receipt.costType]}
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
                    placeholder={PLACEHOLDERS[receipt.costType]}
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
                          const amount = Math.round(km * 0.3 * 100) / 100;
                          updateReceipt(receipt.costType, {
                            kilometers: km,
                            grossAmount: amount,
                            netAmount: amount,
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
                  value={travel.mealDays || ""}
                  onChange={(e) =>
                    set("mealDays", parseFloat(e.target.value) || 0)
                  }
                  placeholder="z.B. 2.5"
                />
              </div>
              <div>
                <Label>Tagessatz (€)</Label>
                <Select
                  value={travel.mealRate ? String(travel.mealRate) : ""}
                  onValueChange={(v) => set("mealRate", parseFloat(v) || 0)}
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
                  value={`${mealTotal.toFixed(2)} €`}
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
          <BankDetailsEditor value={bank} onChange={setBank} />

          <div className="space-y-3">
            {receipts
              .filter((r) => r.grossAmount > 0)
              .map((r) => (
                <div
                  key={r.costType}
                  className="flex items-center justify-between px-3 bg-gray-50 border rounded-md"
                >
                  <div className="flex items-center gap-8 flex-1">
                    <span className="font-semibold">{LABELS[r.costType]}</span>
                    {r.costType === "car" && (
                      <span className="text-sm text-muted-foreground">
                        {r.kilometers} km × 0,30€
                      </span>
                    )}
                  </div>
                  <span className="font-semibold">
                    {r.grossAmount.toFixed(2)} €
                  </span>
                </div>
              ))}
          </div>

          <div className="space-y-3 pt-6">
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-semibold pt-2">
              <span>Gesamt</span>
              <span>{total.toFixed(2)} €</span>
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

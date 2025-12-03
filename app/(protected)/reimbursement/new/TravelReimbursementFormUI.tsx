import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, Pencil } from "lucide-react";
import { useState } from "react";
import { ReceiptUpload } from "./ReceiptUpload";

type TransportationMode = "car" | "train" | "flight" | "taxi" | "bus";

type TravelDetails = {
  travelStartDate: string;
  travelEndDate: string;
  destination: string;
  travelPurpose: string;
  isInternational: boolean;
  transportationMode: TransportationMode;
  kilometers: number;
  transportationAmount: number;
  accommodationAmount: number;
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
  travelDetails: TravelDetails;
  setTravelDetails: (details: TravelDetails) => void;
  handleSubmit: () => void;
  reimbursementType: "expense" | "travel";
  setReimbursementType: (type: "expense" | "travel") => void;
};

export function TravelReimbursementFormUI({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  bankDetails,
  setBankDetails,
  editingBank,
  setEditingBank,
  travelDetails,
  setTravelDetails,
  handleSubmit,
  reimbursementType,
  setReimbursementType,
}: Props) {
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);

  const totalAmount =
    travelDetails.transportationAmount + travelDetails.accommodationAmount;

  const hasBasicInfo =
    travelDetails.destination &&
    travelDetails.travelPurpose &&
    travelDetails.travelStartDate &&
    travelDetails.travelEndDate;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Neue Erstattung</h1>

        <div className="flex items-center gap-3">
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

          <Select
            value={selectedProjectId || ""}
            onValueChange={(value) =>
              setSelectedProjectId(value as Id<"projects">)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Projekt wählen" />
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

      {/* Travel Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Reiseangaben</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Reiseziel *</Label>
            <Input
              value={travelDetails.destination}
              onChange={(e) =>
                setTravelDetails({
                  ...travelDetails,
                  destination: e.target.value,
                })
              }
              placeholder="z.B. München, Berlin"
            />
          </div>
          <div>
            <Label>Reisezweck *</Label>
            <Input
              value={travelDetails.travelPurpose}
              onChange={(e) =>
                setTravelDetails({
                  ...travelDetails,
                  travelPurpose: e.target.value,
                })
              }
              placeholder="z.B. Kundentermin, Konferenz"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>Reisebeginn *</Label>
            <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !travelDetails.travelStartDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {travelDetails.travelStartDate
                    ? format(
                        new Date(travelDetails.travelStartDate),
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
                    travelDetails.travelStartDate
                      ? new Date(travelDetails.travelStartDate)
                      : undefined
                  }
                  onSelect={(date) => {
                    setTravelDetails({
                      ...travelDetails,
                      travelStartDate: date ? format(date, "yyyy-MM-dd") : "",
                    });
                    setStartCalendarOpen(false);
                  }}
                  locale={de}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Reiseende *</Label>
            <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !travelDetails.travelEndDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {travelDetails.travelEndDate
                    ? format(
                        new Date(travelDetails.travelEndDate),
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
                    travelDetails.travelEndDate
                      ? new Date(travelDetails.travelEndDate)
                      : undefined
                  }
                  onSelect={(date) => {
                    setTravelDetails({
                      ...travelDetails,
                      travelEndDate: date ? format(date, "yyyy-MM-dd") : "",
                    });
                    setEndCalendarOpen(false);
                  }}
                  locale={de}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="col-span-2 flex items-end pb-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="international"
                checked={travelDetails.isInternational}
                onCheckedChange={(checked: boolean) =>
                  setTravelDetails({
                    ...travelDetails,
                    isInternational: checked,
                  })
                }
              />
              <Label htmlFor="international" className="font-normal">
                Auslandsreise
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Costs - only show when basic info is filled */}
      {hasBasicInfo && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Kosten</h2>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>Verkehrsmittel</Label>
              <Select
                value={travelDetails.transportationMode}
                onValueChange={(value) =>
                  setTravelDetails({
                    ...travelDetails,
                    transportationMode: value as TransportationMode,
                    // Reset kilometers when switching away from car
                    kilometers: value === "car" ? travelDetails.kilometers : 0,
                    transportationAmount:
                      value === "car"
                        ? travelDetails.kilometers * 0.3
                        : travelDetails.transportationAmount,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">PKW (Privat)</SelectItem>
                  <SelectItem value="train">Bahn</SelectItem>
                  <SelectItem value="flight">Flugzeug</SelectItem>
                  <SelectItem value="taxi">Taxi</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {travelDetails.transportationMode === "car" ? (
              <>
                <div>
                  <Label>Kilometer *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={travelDetails.kilometers || ""}
                    onChange={(e) => {
                      const km = Math.max(
                        0,
                        Math.floor(parseFloat(e.target.value) || 0),
                      );
                      setTravelDetails({
                        ...travelDetails,
                        kilometers: km,
                        transportationAmount: Math.round(km * 0.3 * 100) / 100,
                      });
                    }}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Fahrtkosten (0,30€/km)
                  </Label>
                  <Input
                    value={`${travelDetails.transportationAmount.toFixed(2)} €`}
                    disabled
                    className="bg-muted/50 font-mono"
                  />
                </div>
              </>
            ) : (
              <div>
                <Label>Fahrtkosten (€) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={travelDetails.transportationAmount || ""}
                  onChange={(e) =>
                    setTravelDetails({
                      ...travelDetails,
                      transportationAmount: Math.max(
                        0,
                        parseFloat(e.target.value) || 0,
                      ),
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            )}

            <div>
              <Label>Übernachtung (€)</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={travelDetails.accommodationAmount || ""}
                onChange={(e) =>
                  setTravelDetails({
                    ...travelDetails,
                    accommodationAmount: Math.max(
                      0,
                      parseFloat(e.target.value) || 0,
                    ),
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      )}

      {/* Receipt Upload - only show when there are costs */}
      {totalAmount > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Belege hochladen</h2>
            <span className="text-sm text-muted-foreground">Optional</span>
          </div>
          <ReceiptUpload
            onUploadComplete={(storageId) =>
              setTravelDetails({ ...travelDetails, fileStorageId: storageId })
            }
            storageId={travelDetails.fileStorageId || undefined}
          />
        </div>
      )}

      {/* Summary - only show when there are costs */}
      {totalAmount > 0 && (
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

          {/* Cost breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-3 bg-gray-50 border rounded-md">
              <div className="flex items-center gap-8 flex-1">
                <span className="font-semibold">Fahrtkosten</span>
                <span className="text-sm text-muted-foreground">
                  {travelDetails.transportationMode === "car"
                    ? `${travelDetails.kilometers} km × 0,30€`
                    : travelDetails.transportationMode === "train"
                      ? "Bahn"
                      : travelDetails.transportationMode === "flight"
                        ? "Flug"
                        : travelDetails.transportationMode === "taxi"
                          ? "Taxi"
                          : "Bus"}
                </span>
              </div>
              <span className="font-semibold">
                {travelDetails.transportationAmount.toFixed(2)} €
              </span>
            </div>

            {travelDetails.accommodationAmount > 0 && (
              <div className="flex items-center justify-between px-3 bg-gray-50 border rounded-md">
                <div className="flex items-center gap-8 flex-1">
                  <span className="font-semibold">Übernachtung</span>
                  <span className="text-sm text-muted-foreground">
                    {travelDetails.destination}
                  </span>
                </div>
                <span className="font-semibold">
                  {travelDetails.accommodationAmount.toFixed(2)} €
                </span>
              </div>
            )}
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

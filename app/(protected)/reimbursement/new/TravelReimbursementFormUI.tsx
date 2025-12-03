import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, Car, Pencil } from "lucide-react";
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
  setBankDetails: (details: { iban: string; bic: string; accountHolder: string }) => void;
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

  const totalAmount = travelDetails.transportationAmount + travelDetails.accommodationAmount;


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      {/* Type Selector */}
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

      {/* Travel Details */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Reiseangaben</h2>

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
              placeholder="z.B. München, Berlin, London"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="international"
              checked={travelDetails.isInternational}
              onCheckedChange={(checked: boolean) =>
                setTravelDetails({ ...travelDetails, isInternational: checked })
              }
            />
            <Label htmlFor="international">Auslandsreise</Label>
          </div>
        </div>

        <div>
          <Label>Reisezweck *</Label>
          <Textarea
            value={travelDetails.travelPurpose}
            onChange={(e) =>
              setTravelDetails({
                ...travelDetails,
                travelPurpose: e.target.value,
              })
            }
            placeholder="z.B. Kundentermin, Konferenz, Schulung"
            rows={2}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Reisebeginn *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 size-4" />
                  {travelDetails.travelStartDate
                    ? format(new Date(travelDetails.travelStartDate), "dd.MM.yyyy", { locale: de })
                    : "Startdatum wählen"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={travelDetails.travelStartDate ? new Date(travelDetails.travelStartDate) : undefined}
                  onSelect={(date) => setTravelDetails({
                    ...travelDetails,
                    travelStartDate: date ? format(date, "yyyy-MM-dd") : "",
                  })}
                  locale={de}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Reiseende *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 size-4" />
                  {travelDetails.travelEndDate
                    ? format(new Date(travelDetails.travelEndDate), "dd.MM.yyyy", { locale: de })
                    : "Enddatum wählen"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={travelDetails.travelEndDate ? new Date(travelDetails.travelEndDate) : undefined}
                  onSelect={(date) => setTravelDetails({
                    ...travelDetails,
                    travelEndDate: date ? format(date, "yyyy-MM-dd") : "",
                  })}
                  locale={de}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Transportation */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Fahrtkosten</h2>

        <div>
          <Label>Verkehrsmittel</Label>
          <Select
            value={travelDetails.transportationMode}
            onValueChange={(value) =>
              setTravelDetails({
                ...travelDetails,
                transportationMode: value as TravelDetails["transportationMode"],
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

        {travelDetails.transportationMode === "car" && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center gap-2">
              <Car className="size-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">PKW-Abrechnung (0,30€/km)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gefahrene Kilometer *</Label>
                <Input
                  type="number"
                  value={travelDetails.kilometers || ""}
                  onChange={(e) => {
                    const km = parseFloat(e.target.value) || 0;
                    setTravelDetails({
                      ...travelDetails,
                      kilometers: km,
                      transportationAmount: km * 0.3,
                    });
                  }}
                  placeholder="z.B. 150"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Fahrtkosten (€)</Label>
                <Input
                  type="number"
                  value={travelDetails.transportationAmount.toFixed(2)}
                  disabled
                  className="bg-muted/50 font-mono"
                />
              </div>
            </div>
            <p className="text-sm text-blue-700">
              Die Fahrtkosten werden automatisch mit 0,30€ pro Kilometer berechnet.
            </p>
          </div>
        )}

        {travelDetails.transportationMode !== "car" && (
          <div>
            <Label>Fahrtkosten (€)</Label>
            <Input
              type="number"
              step="0.01"
              value={travelDetails.transportationAmount || ""}
              onChange={(e) =>
                setTravelDetails({
                  ...travelDetails,
                  transportationAmount: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="z.B. 89.90"
            />
          </div>
        )}
      </div>

      {/* Accommodation */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Übernachtungskosten</h2>

        <div>
          <Label>Übernachtungskosten (€)</Label>
          <Input
            type="number"
            step="0.01"
            value={travelDetails.accommodationAmount || ""}
            onChange={(e) =>
              setTravelDetails({
                ...travelDetails,
                accommodationAmount: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="z.B. 120.00"
          />
        </div>
      </div>

      {/* Receipt Upload */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Beleg hochladen</h2>

        <div>
          <Label>Reisebelege (optional)</Label>
          <ReceiptUpload
            onUploadComplete={(storageId) =>
              setTravelDetails({ ...travelDetails, fileStorageId: storageId })
            }
            storageId={travelDetails.fileStorageId || undefined}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Laden Sie Belege für Fahrt- und Übernachtungskosten hoch.
          </p>
        </div>
      </div>

      {/* Summary */}
      {(travelDetails.transportationAmount > 0 || travelDetails.accommodationAmount > 0) && (
        <div className="space-y-8">
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
            <div className="flex items-center justify-between px-3 bg-gray-50 border rounded-md">
              <div className="flex items-center gap-8 flex-1">
                <span className="font-semibold">Fahrtkosten</span>
                <span className="text-sm text-muted-foreground">
                  {travelDetails.transportationMode === "car" 
                    ? `${travelDetails.kilometers} km à 0,30€`
                    : travelDetails.transportationMode}
                </span>
              </div>
              <span className="font-semibold">
                {travelDetails.transportationAmount.toFixed(2)} €
              </span>
            </div>

            {travelDetails.accommodationAmount > 0 && (
              <div className="flex items-center justify-between px-3 bg-gray-50 border rounded-md">
                <div className="flex items-center gap-8 flex-1">
                  <span className="font-semibold">Übernachtungskosten</span>
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

          <div className="flex justify-between text-lg font-semibold pt-6">
            <span>Gesamtbetrag</span>
            <span>{totalAmount.toFixed(2)} €</span>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-14 font-semibold mt-8"
            size="lg"
          >
            Reisekosten zur Genehmigung einreichen
          </Button>
        </div>
      )}
    </div>
  );
}
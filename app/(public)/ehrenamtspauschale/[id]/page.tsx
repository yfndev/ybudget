"use client";

import { SignatureCanvas } from "@/components/Reimbursements/SignatureCanvas";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ExternalEhrenamtspauschalePage() {
  const { id } = useParams<{ id: Id<"volunteerAllowance"> }>();

  const linkData = useQuery(api.volunteerAllowance.queries.validateLink, { id });
  const generateUploadUrl = useMutation(
    api.volunteerAllowance.functions.generatePublicUploadUrl
  );
  const submitExternal = useMutation(
    api.volunteerAllowance.functions.submitExternal
  );

  const [signatureStorageId, setSignatureStorageId] =
    useState<Id<"_storage"> | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    volunteerName: "",
    volunteerStreet: "",
    volunteerPlz: "",
    volunteerCity: "",
    activityDescription: "",
    startDate: "",
    endDate: "",
    amount: "",
    iban: "",
    bic: "",
    accountHolder: "",
    confirmation: false,
  });

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (
    linkData?.valid &&
    !form.activityDescription &&
    linkData.activityDescription
  ) {
    setForm((prev) => ({
      ...prev,
      activityDescription: linkData.activityDescription || "",
      startDate: linkData.startDate || "",
      endDate: linkData.endDate || "",
    }));
  }

  const handleSubmit = async () => {
    if (
      !form.volunteerName ||
      !form.volunteerStreet ||
      !form.volunteerPlz ||
      !form.volunteerCity
    ) {
      return toast.error("Bitte alle persönlichen Daten ausfüllen");
    }
    if (!form.activityDescription || !form.startDate || !form.endDate) {
      return toast.error("Bitte Tätigkeit und Zeitraum angeben");
    }
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0)
      return toast.error("Bitte einen gültigen Betrag eingeben");
    if (amount > 840)
      return toast.error("Ehrenamtspauschale darf 840€ nicht überschreiten");
    if (!form.iban || !form.bic || !form.accountHolder)
      return toast.error("Bitte Bankdaten ausfüllen");
    if (!form.confirmation)
      return toast.error("Bitte die Bestätigung ankreuzen");
    if (!signatureStorageId) return toast.error("Bitte unterschreiben");

    setIsSubmitting(true);
    try {
      await submitExternal({
        id,
        amount,
        iban: form.iban,
        bic: form.bic,
        accountHolder: form.accountHolder,
        activityDescription: form.activityDescription,
        startDate: form.startDate,
        endDate: form.endDate,
        volunteerName: form.volunteerName,
        volunteerStreet: form.volunteerStreet,
        volunteerPlz: form.volunteerPlz,
        volunteerCity: form.volunteerCity,
        signatureStorageId,
      });
      setSubmitted(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Fehler beim Einreichen"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!linkData) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!linkData.valid) {
    return (
      <div className="flex min-h-svh items-center justify-center p-8">
        <div className="text-center max-w-md">
          <AlertCircle className="size-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Link ungültig</h1>
          <p className="text-muted-foreground">{linkData.error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-svh items-center justify-center p-8">
        <div className="text-center max-w-md">
          <CheckCircle2 className="size-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Erfolgreich eingereicht</h1>
          <p className="text-muted-foreground">
            Deine Ehrenamtspauschale wurde erfolgreich eingereicht. Du kannst
            dieses Fenster jetzt schließen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh py-8">
      <div className="max-w-2xl mx-auto px-6 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Ehrenamtspauschale</h1>
          <p className="text-muted-foreground mt-2">
            {linkData.organizationName} - {linkData.projectName}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Persönliche Daten</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Name *</Label>
              <Input
                value={form.volunteerName}
                onChange={(event) =>
                  updateField("volunteerName", event.target.value)
                }
                placeholder="Vor- und Nachname"
              />
            </div>
            <div className="col-span-2">
              <Label>Straße und Hausnummer *</Label>
              <Input
                value={form.volunteerStreet}
                onChange={(event) =>
                  updateField("volunteerStreet", event.target.value)
                }
                placeholder="Musterstraße 123"
              />
            </div>
            <div>
              <Label>PLZ *</Label>
              <Input
                value={form.volunteerPlz}
                onChange={(event) =>
                  updateField("volunteerPlz", event.target.value)
                }
                placeholder="12345"
              />
            </div>
            <div>
              <Label>Ort *</Label>
              <Input
                value={form.volunteerCity}
                onChange={(event) =>
                  updateField("volunteerCity", event.target.value)
                }
                placeholder="Musterstadt"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Tätigkeit</h2>
          <div>
            <Label>Beschreibung der nebenberuflichen Tätigkeit *</Label>
            <Textarea
              value={form.activityDescription}
              onChange={(event) =>
                updateField("activityDescription", event.target.value)
              }
              placeholder="z.B. Übungsleiter, Jugendarbeit, Vorstandstätigkeit"
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Von *</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  updateField("startDate", event.target.value)
                }
              />
            </div>
            <div>
              <Label>Bis *</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(event) => updateField("endDate", event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Betrag</h2>
          <div className="max-w-xs">
            <Label>Betrag in Euro (max. 840€) *</Label>
            <Input
              type="number"
              step="0.01"
              max="840"
              value={form.amount}
              onChange={(event) => updateField("amount", event.target.value)}
              placeholder="0,00"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Bankverbindung</h2>
          <div className="grid gap-4">
            <div>
              <Label>Kontoinhaber *</Label>
              <Input
                value={form.accountHolder}
                onChange={(event) =>
                  updateField("accountHolder", event.target.value)
                }
                placeholder="Max Mustermann"
              />
            </div>
            <div>
              <Label>IBAN *</Label>
              <Input
                value={form.iban}
                onChange={(event) => updateField("iban", event.target.value)}
                placeholder="DE89 3704 0044 0532 0130 00"
                className="font-mono"
              />
            </div>
            <div>
              <Label>BIC *</Label>
              <Input
                value={form.bic}
                onChange={(event) => updateField("bic", event.target.value)}
                placeholder="COBADEFFXXX"
                className="font-mono"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Bestätigung</h2>
          <div className="flex items-start gap-3">
            <Checkbox
              id="confirmation"
              checked={form.confirmation}
              onCheckedChange={(checked) =>
                updateField("confirmation", checked === true)
              }
            />
            <Label htmlFor="confirmation" className="text-sm leading-relaxed">
              Ich erkläre, dass die Steuerbefreiung nach § 3 Nr. 26a EStG für
              nebenberufliche ehrenamtliche Tätigkeit in voller Höhe von 840,00
              Euro in Anspruch genommen werden kann. Sollte sich im Lauf des
              Jahres eine Änderung ergeben, informiere ich hierüber unverzüglich
              den Verein.
            </Label>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Unterschrift</h2>
          <SignatureCanvas
            onUploadComplete={setSignatureStorageId}
            storageId={signatureStorageId || undefined}
            generateUploadUrl={() => generateUploadUrl({ id })}
          />
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full h-14 font-semibold"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="size-5 animate-spin mr-2" />}
          Einreichen
        </Button>
      </div>
    </div>
  );
}

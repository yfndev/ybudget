import { AmountInput } from "@/components/Selectors/AmountInput";
import { DateInput } from "@/components/Selectors/DateInput";
import { SelectCategory } from "@/components/Selectors/SelectCategory";
import { SelectDonor } from "@/components/Selectors/SelectDonor";
import { SelectProject } from "@/components/Selectors/SelectProject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

type TransactionType = "income" | "expense";

export function TransactionSheet({
  type,
  open,
  onOpenChange,
}: {
  type: TransactionType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const [donor, setDonor] = useState("");

  const amountInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const counterpartyInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const donorInputRef = useRef<HTMLInputElement>(null);

  const addTransaction = useMutation(
    api.transactions.functions.createExpectedTransaction,
  );

  const focusNext = (ref: React.RefObject<HTMLElement | null>) => {
    setTimeout(() => ref.current?.focus(), 0);
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    nextRef: React.RefObject<HTMLElement | null>,
  ) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      focusNext(nextRef);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !project || !counterparty || !category) {
      toast.error("Füll bitte alle erforderlichen Felder aus");
      return;
    }

    try {
      const numAmount = parseFloat(amount.replace(",", "."));
      const dateTimestamp = date ? new Date(date).getTime() : Date.now();
      await addTransaction({
        projectId: project as Id<"projects">,
        date: dateTimestamp,
        amount: type === "expense" ? -numAmount : numAmount,
        description,
        counterparty,
        categoryId: category as Id<"categories">,
        status: "expected",
        donorId: donor ? (donor as Id<"donors">) : undefined,
      });
      toast.success(
        type === "expense" ? "Ausgabe gespeichert!" : "Einnahme gespeichert!",
      );
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";
      if (errorMessage.includes("cannot be used for category")) {
        toast.error(
          "Der Förderer kann nicht für diese Kategorie verwendet werden. Wähle bitte einen anderen Förderer aus",
        );
      } else {
        toast.error("Oh nein! Es gab einen Fehler beim Speichern :(");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const title = type === "expense" ? "Ausgabe planen" : "Einnahme erfassen";
  const counterpartyLabel = type === "expense" ? "Empfänger" : "Von";
  const submitButtonText =
    type === "expense" ? "Ausgabe planen" : "Einnahme erfassen";

  const isFormValid = amount && project && counterparty && category && date;

  const handleSheetOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setAmount("");
      setCategory("");
      setDate("");
      setCounterparty("");
      setDescription("");
      setProject("");
      setDonor("");
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 0);
    }
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        className="w-full sm:max-w-lg overflow-y-auto flex flex-col p-0"
        onKeyDown={handleKeyDown}
      >
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="text-2xl">{title}</SheetTitle>
          <SheetDescription className="text-xs mt-0.5">
            Alle Felder müssen ausgefüllt sein
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-6 px-6 py-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="amount" className="text-base">
              Wie viel?
            </Label>
            <AmountInput
              ref={amountInputRef}
              value={amount}
              onChange={setAmount}
              onTabPressed={() => focusNext(dateInputRef)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  focusNext(dateInputRef);
                }
              }}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-base">Wann?</Label>
            <DateInput ref={dateInputRef} value={date} onChange={setDate} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="counterparty">{counterpartyLabel}</Label>
            <Input
              ref={counterpartyInputRef}
              id="counterparty"
              placeholder={
                type === "expense"
                  ? "z.B. Lieferant, Firma..."
                  : "z.B. Kunde, Firma..."
              }
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, descriptionInputRef)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              ref={descriptionInputRef}
              id="description"
              placeholder={
                type === "expense"
                  ? "Details zur Ausgabe..."
                  : "Details zur Einnahme..."
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, projectInputRef)}
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-base">Projekt</Label>
            <SelectProject
              ref={projectInputRef}
              value={project}
              onValueChange={(value) => {
                setProject(value);
                focusNext(categoryInputRef);
              }}
              onTabPressed={() => focusNext(categoryInputRef)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Kategorie</Label>
            <SelectCategory
              ref={categoryInputRef}
              value={category as Id<"categories">}
              onValueChange={(value) => {
                setCategory(value);
                focusNext(donorInputRef);
              }}
              onTabPressed={() => focusNext(donorInputRef)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Förderer</Label>
            <SelectDonor
              ref={donorInputRef}
              value={donor}
              onValueChange={setDonor}
            />
          </div>
        </div>

        <div className="px-6 pb-6 pt-4">
          <div className="space-y-2">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="w-full h-12 text-base"
            >
              {submitButtonText}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              oder{" "}
              <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs">
                ⌘ Enter
              </kbd>
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

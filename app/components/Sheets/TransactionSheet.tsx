import { AmountInput } from "@/components/Selectors/AmountInput";
import { SelectCategory } from "@/components/Selectors/SelectCategory";
import { SelectDonor } from "@/components/Selectors/SelectDonor";
import { SelectProject } from "@/components/Selectors/SelectProject";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [counterparty, setCounterparty] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const [donor, setDonor] = useState("");
  const [dateOpen, setDateOpen] = useState(false);

  const amountInputRef = useRef<HTMLInputElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const counterpartyInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const projectButtonRef = useRef<HTMLButtonElement>(null);
  const categoryButtonRef = useRef<HTMLButtonElement>(null);
  const donorButtonRef = useRef<HTMLButtonElement>(null);

  const addTransaction = useMutation(
    api.transactions.functions.createExpectedTransaction,
  );

  const dateColor = date ? "text-foreground" : "text-muted-foreground";

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
      await addTransaction({
        projectId: project as Id<"projects">,
        date: date?.getTime() ?? Date.now(),
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
      setDate(undefined);
      setCounterparty("");
      setDescription("");
      setProject("");
      setDonor("");
      setDateOpen(false);
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
              onTabPressed={() => focusNext(dateButtonRef)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  focusNext(dateButtonRef);
                }
              }}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-base">Wann?</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  ref={dateButtonRef}
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onKeyDown={(e) => {
                    if (e.key === "Tab") {
                      e.preventDefault();
                      focusNext(counterpartyInputRef);
                    }
                  }}
                >
                  <CalendarIcon className={cn("mr-2 h-4 w-4", dateColor)} />
                  <span className={cn("font-medium", dateColor)}>
                    {date ? format(date, "dd.MM.yyyy") : "Datum wählen"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    setDateOpen(false);
                    focusNext(counterpartyInputRef);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
              onKeyDown={(e) => handleKeyPress(e, projectButtonRef)}
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-base">Projekt</Label>
            <SelectProject
              value={project}
              onValueChange={(value) => {
                setProject(value);
                focusNext(categoryButtonRef);
              }}
              onTabPressed={() => focusNext(categoryButtonRef)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Kategorie</Label>
            <SelectCategory
              ref={categoryButtonRef}
              value={category as Id<"categories">}
              onValueChange={(value) => {
                setCategory(value);
                focusNext(donorButtonRef);
              }}
              onTabPressed={() => focusNext(donorButtonRef)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Förderer</Label>
            <SelectDonor
              ref={donorButtonRef}
              value={donor}
              onValueChange={setDonor}
              categoryId={category ? (category as Id<"categories">) : undefined}
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

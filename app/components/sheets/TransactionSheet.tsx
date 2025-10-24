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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../../convex/_generated/api";
import { AmountInput } from "./AmountInput";
import { SelectCategory } from "./SelectCategory";
import { SelectProject } from "./SelectProject";

const formatAmount = (amount: string) => (amount ? `${amount} €` : "");

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
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [counterparty, setCounterparty] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const isExpense = type === "expense";

  const addTransaction = useMutation(
    api.functions.transactionMutations.addExpectedTransaction
  );

  const dateColor = date ? "text-foreground" : "text-muted-foreground";

  const resetForm = () => {
    setStep(1);
    setAmount("");
    setCategory("");
    setDate(undefined);
    setCounterparty("");
    setDescription("");
    setProject("");
  };

  useEffect(() => {
    if (open) resetForm();
  }, [open]);

  const handleSubmit = async () => {
    try {
      await addTransaction({
        projectId: project,
        expectedDate: date?.getTime() ?? Date.now(),
        amount: parseFloat(amount),
        reference: counterparty,
        categoryId: category,
        isExpense: isExpense,
      });
      toast.success(
        isExpense ? "Ausgabe gespeichert!" : "Einnahme gespeichert!"
      );
      onOpenChange(false);
    } catch (error) {
      toast.error("Fehler beim Speichern :(");
    }
  };

  const canContinue = amount;

  const title = isExpense ? "Ausgabe planen" : "Einnahme erfassen";
  const counterpartyLabel = isExpense ? "Empfänger" : "Von";
  const submitButtonText = isExpense ? "Ausgabe planen" : "Einnahme erfassen";

  const renderStepOne = () => (
    <div className="flex-1 flex flex-col gap-8 px-6 py-4">
      <p className="text-sm text-muted-foreground">
        {isExpense
          ? "Du möchtest eine Ausgabe planen? Dann gib bitte alle nötigen Infos ein, um das Budget bestmöglich zu planen :)"
          : "Du möchtest eine Einnahme erfassen? Dann gib bitte alle nötigen Infos ein, um das Budget bestmöglich zu planen :)"}
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Label htmlFor="amount" className="text-base">
            Wie viel?
          </Label>
          <AmountInput value={amount} onChange={setAmount} autoFocus />
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-base">Wann?</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
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
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Label className="text-base">Projekt</Label>
        <SelectProject value={project} onValueChange={setProject} />
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="flex-1 flex flex-col gap-6 px-6 py-4">
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span className="font-medium">
          {formatAmount(amount)} •{" "}
          {date ? format(date, "dd.MM.yyyy") : "Kein Datum"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="counterparty">{counterpartyLabel}</Label>
        <Input
          id="counterparty"
          placeholder={
            isExpense ? "z.B. Lieferant, Firma..." : "z.B. Kunde, Firma..."
          }
          value={counterparty}
          onChange={(e) => setCounterparty(e.target.value)}
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea
          id="description"
          placeholder={
            isExpense ? "Details zur Ausgabe..." : "Details zur Einnahme..."
          }
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[80px] resize-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Kategorie</Label>
        <SelectCategory value={category} onValueChange={setCategory} />
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep(1)}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <SheetTitle className="text-2xl">{title}</SheetTitle>
              <SheetDescription className="text-xs mt-0.5">
                Schritt {step} von 2
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {step === 1 ? renderStepOne() : renderStepTwo()}

        <SheetFooter className="px-6 pb-6 pt-4">
          <Button
            onClick={step === 1 ? () => setStep(2) : handleSubmit}
            disabled={step === 1 && !canContinue}
            className="w-full h-12 text-base"
          >
            {step === 1 ? "Weiter" : submitButtonText}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

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
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { SelectCategory } from "../SelectCategory";
import { SelectProject } from "../SelectProject";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../ui/input-group";

export function ExpenseInputSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [project, setProject] = useState("");
  const [category, setCategory] = useState("");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto flex flex-col">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl">Ausgabe planen</SheetTitle>
          <SheetDescription>
            Erfasse eine geplante Ausgabe für dein Budget.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-6 px-6 py-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="recipient">An wen geht das Geld?</Label>
            <Input id="recipient" placeholder="z.B. Lieferant, Firma..." />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="purpose">Wofür ist diese Ausgabe?</Label>
            <Textarea
              id="purpose"
              placeholder="Beschreibe kurz den Zweck..."
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Wie viel?</Label>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>€</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput id="amount" placeholder="0.00" />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>EUR</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Wann muss es gezahlt sein?</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd.MM.yyyy") : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Projekt wählen</Label>
            <SelectProject value={project} onValueChange={setProject} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Kategorie wählen</Label>
            <SelectCategory value={category} onValueChange={setCategory} />
          </div>
        </div>

        <SheetFooter className="pt-6">
          <Button type="submit" className="w-full">
            Ausgabe planen
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

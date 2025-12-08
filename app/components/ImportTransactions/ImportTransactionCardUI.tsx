import { SelectCategory } from "@/components/Selectors/SelectCategory";
import { SelectDonor } from "@/components/Selectors/SelectDonor";
import { SelectProject } from "@/components/Selectors/SelectProject";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { useRef } from "react";

interface ImportTransactionCardUIProps {
  transaction: Doc<"transactions">;
  currentIndex: number;
  totalCount: number;
  projectId: string;
  categoryId: string;
  donorId: string;
  splitIncome: boolean;
  onProjectChange: (projectId: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onDonorChange: (donorId: string) => void;
  onSplitIncomeChange: (splitIncome: boolean) => void;
}

export const ImportTransactionCardUI = ({
  transaction,
  currentIndex,
  totalCount,
  projectId,
  categoryId,
  donorId,
  splitIncome,
  onProjectChange,
  onCategoryChange,
  onDonorChange,
  onSplitIncomeChange,
}: ImportTransactionCardUIProps) => {
  const categoryRef = useRef<HTMLInputElement>(null);
  const donorRef = useRef<HTMLInputElement>(null);

  const focusCategory = () => setTimeout(() => categoryRef.current?.focus(), 0);
  const focusDonor = () => setTimeout(() => donorRef.current?.focus(), 0);

  const isExpense = transaction.amount < 0;
  const isIncome = transaction.amount > 0;

  return (
    <Card className="w-full max-w-xl p-8 border shadow-sm flex flex-col">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2">
              {transaction.counterparty || ""}
            </h2>
            {transaction.description && (
              <p className="text-base text-muted-foreground">
                {transaction.description}
              </p>
            )}
          </div>
          <div className="ml-6 px-3 py-1.5 rounded-md bg-muted text-sm text-muted-foreground">
            {currentIndex} / {totalCount}
          </div>
        </div>

        <div className="flex items-baseline gap-16 pt-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">
              Betrag
            </div>
            <div className="text-base font-semibold tabular-nums">
              {formatCurrency(transaction.amount)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">
              Datum
            </div>
            <div className="text-base font-semibold">
              {new Date(transaction.date).toLocaleDateString("de-DE")}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {!splitIncome && (
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold">Projekt</Label>
            <SelectProject
              value={projectId}
              onValueChange={(v) => {
                onProjectChange(v);
                focusCategory();
              }}
              onTabPressed={focusCategory}
            />
          </div>
        )}

        {splitIncome && (
          <div className="p-3 bg-muted/30 rounded-lg border border-muted text-sm text-muted-foreground">
            Projekt wird nicht zugewiesen, da Budget auf Departments aufgeteilt
            wird
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-semibold">Kategorie</Label>
          <SelectCategory
            ref={categoryRef}
            value={categoryId}
            onValueChange={(v) => {
              onCategoryChange(v);
              focusDonor();
            }}
            onTabPressed={focusDonor}
          />
        </div>

        {isIncome && (
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold">Förderer</Label>
            <SelectDonor
              ref={donorRef}
              value={donorId}
              onValueChange={onDonorChange}
            />
          </div>
        )}

        {isExpense && (
          <div className="flex flex-col gap-2">
            <Label className="flex flex-col">
              <span className="text-sm font-semibold">
                Projektförderer wählen
              </span>
              <span className="text-muted-foreground font-normal">
                (nur wenn Mittelverwendungsnachweis erforderlich)
              </span>
            </Label>
            <SelectDonor
              ref={donorRef}
              value={donorId}
              onValueChange={onDonorChange}
              projectId={projectId as Id<"projects"> | undefined}
            />
          </div>
        )}

        {isIncome && (
          <div className="flex items-center gap-3">
            <Checkbox
              id="splitIncome"
              checked={splitIncome}
              onCheckedChange={(checked) =>
                onSplitIncomeChange(checked === true)
              }
            />
            <Label htmlFor="splitIncome">
              Einnahme auf Departments aufteilen
            </Label>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3 mt-auto pt-6 text-xs text-muted-foreground">
        <span className="font-medium">⌘↩ Speichern</span>
        <span className="text-muted-foreground/50">•</span>
        <span>→ Überspringen</span>
        <span className="text-muted-foreground/50">•</span>
        <span>← Zurück</span>
      </div>
    </Card>
  );
};

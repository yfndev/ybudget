import { SelectCategory } from "@/components/Selectors/SelectCategory";
import { SelectDonor } from "@/components/Selectors/SelectDonor";
import { SelectProject } from "@/components/Selectors/SelectProject";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { Id } from "@/convex/_generated/dataModel";

interface ImportTransactionCardUIProps {
  title: string;
  description?: string;
  amount: number;
  date: Date;
  currentIndex: number;
  totalCount: number;
  projectId: string;
  categoryId: string;
  donorId: string;
  isExpense: boolean;
  isIncome: boolean;

  onProjectChange: (projectId: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onDonorChange: (donorId: string) => void;
}

export const ImportTransactionCardUI = ({
  title,
  description,
  amount,
  date,
  currentIndex,
  totalCount,
  projectId,
  categoryId,
  donorId,
  isExpense,
  isIncome,

  onProjectChange,
  onCategoryChange,
  onDonorChange,
}: ImportTransactionCardUIProps) => (
  <Card className="w-[600px] h-auto p-8 border shadow-sm flex flex-col ">
    <div className="mb-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-2">{title}</h2>
          {description && (
            <p className="text-base text-muted-foreground">{description}</p>
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
            {new Intl.NumberFormat("de-DE", {
              style: "currency",
              currency: "EUR",
            }).format(amount)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground uppercase mb-1">
            Datum
          </div>
          <div className="text-base font-semibold">
            {date.toLocaleDateString("de-DE")}
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-6 flex-1">
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-semibold">Projekt</Label>
        <SelectProject value={projectId} onValueChange={onProjectChange} />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-semibold">Kategorie</Label>
        <SelectCategory value={categoryId} onValueChange={onCategoryChange} />
      </div>
      {isIncome && (
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-semibold">Förderer</Label>
          <SelectDonor
            value={donorId}
            onValueChange={onDonorChange}
            categoryId={
              categoryId ? (categoryId as Id<"categories">) : undefined
            }
          />
        </div>
      )}
      {isExpense && (
        <div className="flex flex-col gap-2">
          <Label className="flex flex-col">
            <span className="text-sm font-semibold">
              Projektförderer wählen
            </span>
            <span className="text-muted-foreground    font-normal">
              (nur wenn Mittelverwendungsnachweis (CSV) erforderlich)
            </span>
          </Label>

          <SelectDonor
            value={donorId}
            onValueChange={onDonorChange}
            categoryId={
              categoryId ? (categoryId as Id<"categories">) : undefined
            }
            projectId={projectId ? (projectId as Id<"projects">) : undefined}
          />
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

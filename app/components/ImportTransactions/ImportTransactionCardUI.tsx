import { SelectCategory } from "@/components/Sheets/SelectCategory";
import { SelectDonation } from "@/components/Sheets/SelectDonation";
import { SelectDonor } from "@/components/Sheets/SelectDonor";
import { SelectProject } from "@/components/Sheets/SelectProject";
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
  selectedDonationIds: Id<"transactions">[];
  isExpense: boolean;
  isIncome: boolean;
  hasDonations: boolean;
  onProjectChange: (projectId: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onDonorChange: (donorId: string) => void;
  onDonationIdsChange: (donationIds: Id<"transactions">[]) => void;
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
  selectedDonationIds,
  isExpense,
  isIncome,
  hasDonations,
  onProjectChange,
  onCategoryChange,
  onDonorChange,
  onDonationIdsChange,
}: ImportTransactionCardUIProps) => (
  <Card className="w-[600px] h-auto p-8 border shadow-sm flex flex-col flex-shrink-0 flex-grow-0">
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
      {isExpense && projectId && hasDonations && (
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-semibold">Spende zuordnen</Label>
          <SelectDonation
            projectId={projectId}
            value={selectedDonationIds}
            onValueChange={onDonationIdsChange}
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

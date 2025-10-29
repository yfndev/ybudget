import { SelectCategory } from "../Sheets/SelectCategory";
import { SelectProject } from "../Sheets/SelectProject";
import { Card } from "../ui/card";
import { Label } from "../ui/label";

interface ImportCSVCardProps {
  title: string;
  description?: string;
  amount: number;
  date: Date;
  currentIndex: number;
  totalCount: number;
  projectId: string;
  categoryId: string;
  onProjectChange: (projectId: string) => void;
  onCategoryChange: (categoryId: string) => void;
}

export const ImportCSVCard = ({
  title,
  description,
  amount,
  date,
  currentIndex,
  totalCount,
  projectId,
  categoryId,
  onProjectChange,
  onCategoryChange,
}: ImportCSVCardProps) => {
  return (
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
              }).format(Math.abs(amount))}
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

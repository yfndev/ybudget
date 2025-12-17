import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { useQuery } from "convex/react";
import { useState } from "react";
import { AmountInput } from "../Selectors/AmountInput";
import { Label } from "../ui/label";

interface Props {
  totalAmount: number;
  onBudgetsChange: (
    budgets: Array<{ projectId: string; amount: number }>,
  ) => void;
}

export function BudgetSplit({ totalAmount, onBudgetsChange }: Props) {
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>({});
  const departments = useQuery(api.projects.queries.getDepartments);

  const total = Object.values(budgetInputs).reduce(
    (sum, value) => sum + (parseFloat(value) || 0),
    0,
  );
  const remaining = totalAmount - total;
  const isValid = total > 0 && remaining >= 0;

  const handleAmountChange = (projectId: string, value: string) => {
    const newInputs = { ...budgetInputs };
    if (!value || parseFloat(value) === 0) {
      delete newInputs[projectId];
    } else {
      newInputs[projectId] = value;
    }
    setBudgetInputs(newInputs);
    onBudgetsChange(
      Object.entries(newInputs).map(([id, amount]) => ({
        projectId: id,
        amount: parseFloat(amount) || 0,
      })),
    );
  };

  if (!departments?.length) {
    return (
      <div className="text-sm text-muted-foreground">
        Keine Departments gefunden
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="text-sm text-muted-foreground">
          Gesamt: {formatCurrency(totalAmount)}
        </div>
        <div
          className={`text-sm font-semibold ${!isValid ? "text-destructive" : "text-muted-foreground"}`}
        >
          Verbleibend: {formatCurrency(remaining)}
        </div>
      </div>
      <div className="space-y-3 overflow-y-auto">
        {departments.map((department) => (
          <div
            key={department._id}
            className="flex items-center justify-between gap-3"
          >
            <Label className="text-sm">{department.name}</Label>
            <div className="min-w-32 max-w-32">
              <AmountInput
                value={budgetInputs[department._id] || ""}
                onChange={(value) => handleAmountChange(department._id, value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

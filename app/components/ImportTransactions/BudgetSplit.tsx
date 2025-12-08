import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/formatCurrency";
import { useQuery } from "convex/react";
import { useState } from "react";
import { AmountInput } from "../Selectors/AmountInput";
import { Label } from "../ui/label";

interface BudgetSplitProps {
  totalAmount: number;
  onBudgetsChange: (
    budgets: Array<{ projectId: string; amount: number }>
  ) => void;
}

export default function BudgetSplit({
  totalAmount,
  onBudgetsChange,
}: BudgetSplitProps) {
  const [budgetInputs, setBudgetInputs] = useState<Map<string, string>>(
    new Map()
  );
  const departments = useQuery(api.budgets.queries.getDepartmentProjects);

  const total = Array.from(budgetInputs.values()).reduce(
    (sum, value) => sum + (parseFloat(value) || 0),
    0
  );
  const remaining = totalAmount - total;
  const isValid = total > 0 && remaining >= 0;

  const handleAmountChange = (projectId: string, value: string) => {
    const newBudgetInputs = new Map(budgetInputs);
    if (!value || parseFloat(value) === 0) {
      newBudgetInputs.delete(projectId);
    } else {
      newBudgetInputs.set(projectId, value);
    }
    setBudgetInputs(newBudgetInputs);
    onBudgetsChange(
      Array.from(newBudgetInputs.entries()).map(([id, amount]) => ({
        projectId: id,
        amount: parseFloat(amount) || 0,
      }))
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
                value={budgetInputs.get(department._id) || ""}
                onChange={(value) => handleAmountChange(department._id, value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

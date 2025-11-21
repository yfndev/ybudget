import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/formatCurrency";
import { useQuery } from "convex/react";
import { useState } from "react";
import { AmountInput } from "../Selectors/AmountInput";
import { Label } from "../ui/label";

interface BudgetSplitProps {
  totalAmount: number;
  onAllocationsChange: (
    allocations: Array<{ projectId: string; amount: number }>,
  ) => void;
}

export default function BudgetSplit({
  totalAmount,
  onAllocationsChange,
}: BudgetSplitProps) {
  const [allocations, setAllocations] = useState<Map<string, string>>(
    new Map(),
  );
  const departments = useQuery(api.budgets.queries.getDepartmentProjects);

  const total = Array.from(allocations.values()).reduce(
    (sum, value) => sum + (parseFloat(value) || 0),
    0,
  );
  const remaining = totalAmount - total;
  const isValid = total > 0 && remaining >= 0;

  const handleAmountChange = (projectId: string, value: string) => {
    const newAllocations = new Map(allocations);
    if (!value || parseFloat(value) === 0) {
      newAllocations.delete(projectId);
    } else {
      newAllocations.set(projectId, value);
    }
    setAllocations(newAllocations);
    onAllocationsChange(
      Array.from(newAllocations.entries()).map(([id, amount]) => ({
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
        {departments.map((dept) => (
          <div
            key={dept._id}
            className="flex items-center justify-between gap-3"
          >
            <Label className="text-sm">{dept.name}</Label>
            <div className="min-w-32 max-w-32">
              <AmountInput
                value={allocations.get(dept._id) || ""}
                onChange={(value) => handleAmountChange(dept._id, value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

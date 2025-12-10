import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters/formatCurrency";

interface BudgetCardTypes {
  title: string;
  amount: number;
  description?: string;
}

const BudgetCard = ({ title, amount, description }: BudgetCardTypes) => {
  return (
    <Card className="w-full p-4">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <h3 className="text-base font-semibold">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-auto">
        <span className="text-3xl font-semibold">{formatCurrency(amount)}</span>
      </div>
    </Card>
  );
};

export default BudgetCard;

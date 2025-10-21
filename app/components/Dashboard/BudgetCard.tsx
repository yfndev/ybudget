import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "../ui/card";

interface BudgetCardTypes {
  title: string;
  amount: number;
  changePercent: number;
}

const BudgetCard = ({ title, amount, changePercent }: BudgetCardTypes) => {
  const formattedAmount = `${amount.toLocaleString("de-DE")}€`;
  const isPositive = changePercent >= 0;

  return (
    <Card className="w-full p-3">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold">{title}</h3>
        <div className="px-2  border rounded-md flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-muted-foreground" />
          ) : (
            <TrendingDown className="w-3 h-3 text-muted-foreground" />
          )}
          <span className="text-xs font-medium text-muted-foreground">
            {Math.abs(changePercent)}%
          </span>
        </div>
      </div>
      <div className="">
        <span className="text-3xl font-semibold">{formattedAmount}</span>
      </div>
    </Card>
  );
};

export default BudgetCard;

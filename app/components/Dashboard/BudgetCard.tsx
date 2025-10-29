import { Card } from "../ui/card";



interface BudgetCardTypes {
  title: string;
  amount: number;
  changePercent?: number;
  description?: string;
}

const BudgetCard = ({
  title,
  amount,
  changePercent,
  description,
}: BudgetCardTypes) => {
  const formattedAmount = `${amount.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;

  return (
    <Card className="w-full p-3">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <h3 className="text-base font-semibold">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-2">
        <span className="text-3xl font-semibold">{formattedAmount}</span>
      </div>
    </Card>
  );
};

export default BudgetCard;

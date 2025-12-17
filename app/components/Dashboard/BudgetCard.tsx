import { formatCurrency } from "@/lib/formatters/formatCurrency";

interface BudgetCardTypes {
  title: string;
  amount: number;
  description?: string;
}

export function BudgetCard({ title, amount, description }: BudgetCardTypes) {
  return (
    <div className="border rounded-lg w-full p-3 sm:p-4 flex flex-col h-full">
      <h3 className="text-sm sm:text-base font-semibold">{title}</h3>
      <p className="text-xs text-muted-foreground hidden sm:block sm:min-h-[2.5rem]">
        {description}
      </p>
      <span className="text-xl sm:text-2xl lg:text-3xl font-semibold mt-auto">
        {formatCurrency(amount)}
      </span>
    </div>
  );
}

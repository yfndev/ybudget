"use client";

import { useRouter } from "next/navigation";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";

interface DonorCardProps {
  name: string;
  totalAgreed: number;
  totalPaid: number;
  totalOpen: number;
  donorId?: string;
}

export default function DonorCard({
  name,
  totalAgreed,
  totalPaid,
  totalOpen,
  donorId,
}: DonorCardProps) {
  const router = useRouter();
  
  const safeTotalAgreed = typeof totalAgreed === "number" && !isNaN(totalAgreed) ? totalAgreed : 0;
  const safeTotalPaid = typeof totalPaid === "number" && !isNaN(totalPaid) ? totalPaid : 0;
  const safeTotalOpen = typeof totalOpen === "number" && !isNaN(totalOpen) ? totalOpen : 0;
  
  const progress = safeTotalAgreed > 0 ? (safeTotalPaid / safeTotalAgreed) * 100 : 0;

  const handleClick = () => {
    if (donorId) {
      router.push(`/donors/${donorId}`);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const cardClass = donorId
    ? "w-full h-auto p-4 cursor-pointer hover:border-primary transition-colors"
    : "w-full h-auto p-4";

  return (
    <Card className={cardClass} onClick={handleClick}>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{name}</h3>
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Zugesagt</span>
            <span className="text-sm font-semibold">
              {formatAmount(safeTotalAgreed)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Bezahlt</span>
            <span className="text-sm font-semibold">
              {formatAmount(safeTotalPaid)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Offen</span>
            <span className="text-sm font-semibold">
              {formatAmount(safeTotalOpen)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

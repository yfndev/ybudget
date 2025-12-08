"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { useQuery } from "convex-helpers/react/cache";
import Link from "next/link";

export const donorTypeLabels: Record<string, string> = {
  donation: "Spende",
  sponsoring: "Sponsoring",
};

interface DonorCardProps {
  donorId: Id<"donors">;
}

export default function DonorCard({ donorId }: DonorCardProps) {
  const donor = useQuery(api.donors.queries.getDonorById, {
    donorId,
  });

  if (!donor) {
    return (
      <Card className="w-full p-4 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </Card>
    );
  }

  const progress =
    donor.committedIncome > 0
      ? (donor.paidIncome / donor.committedIncome) * 100
      : 0;

  return (
    <Card className="w-full p-4 cursor-pointer hover:bg-muted transition-colors">
      <Link href={`/donors/${donorId}`}>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">{donor.name}</h3>
              <span className="text-xs text-muted-foreground capitalize">
                {donorTypeLabels[donor.type] ?? donor.type}
              </span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-xs text-muted-foreground">Zugesagt</div>
              <div className="text-sm font-semibold">
                {formatCurrency(donor.committedIncome)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Bezahlt</div>
              <div className="text-sm font-semibold">
                {formatCurrency(donor.paidIncome)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Offen</div>
              <div className="text-sm font-semibold">
                {formatCurrency(donor.openIncome)}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}

"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { useQuery } from "convex/react";
import Link from "next/link";

export const donorTypeLabels: Record<string, string> = {
  donation: "Spende",
  sponsoring: "Sponsoring",
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-sm font-semibold">{formatCurrency(value)}</div>
  </div>
);

export function DonorCard({ donorId }: { donorId: Id<"donors"> }) {
  const donor = useQuery(api.donors.queries.getDonorById, { donorId });

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
    <Link href={`/donors/${donorId}`}>
      <Card className="w-full p-4 cursor-pointer hover:bg-gray-50 transition-colors">
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
          <Stat label="Zugesagt" value={donor.committedIncome} />
          <Stat label="Bezahlt" value={donor.paidIncome} />
          <Stat label="Offen" value={donor.openIncome} />
        </div>
      </Card>
    </Link>
  );
}

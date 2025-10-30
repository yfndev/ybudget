"use client";

import DonorCard from "@/components/Dashboard/DonorCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { SidebarInset } from "@/components/ui/sidebar";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function Donors() {
  const donors = useQuery(api.queries.donorQueries.getDonors);

  return (
    <SidebarInset>
      <div className="p-4 lg:px-6 pb-6 overflow-x-hidden w-full">
        <PageHeader title="Förderer" />
        {donors === undefined ? (
          <div className="text-center py-8 text-muted-foreground">
            Lade Förderer...
          </div>
        ) : donors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Keine Förderer vorhanden
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4 lg:gap-6">
            {donors.map((donor) => (
              <DonorCard
                key={donor._id}
                name={donor.name}
                totalAgreed={donor.totalAgreed}
                totalPaid={donor.totalPaid}
                totalOpen={donor.totalOpen}
                donorId={donor._id}
              />
            ))}
          </div>
        )}
      </div>
    </SidebarInset>
  );
}

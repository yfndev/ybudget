"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { SidebarInset } from "@/components/ui/sidebar";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import DonorCard from "../../components/Donors/DonorCard";

export default function DonorsPage() {
  const donors = useQuery(api.donors.queries.getAllDonors);

  return (
    <SidebarInset>
      <div className="p-4 lg:px-6 pb-6 overflow-x-hidden w-full">
        <PageHeader title="Förderer" />
        
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Verwalte deine Förderer und verfolge deren finanzielle Beiträge
          </p>

          {donors?.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold">Keine Förderer vorhanden</h3>
              <p className="text-muted-foreground mt-2">
                Erstelle deinen ersten Förderer, um zu beginnen.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {donors?.map((donor) => (
                <DonorCard
                  key={donor._id}
                  donorId={donor._id}
                  name={donor.name}
                  type={donor.type}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarInset>
  );
}

"use client";

import DonorCard from "@/components/Dashboard/DonorCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { mockDonors } from "@/components/data/mockDonors";
import { SidebarInset } from "@/components/ui/sidebar";

export default function Donors() {
  return (
    <SidebarInset>
      <div className="px-4 lg:px-6 pb-6 overflow-x-hidden w-full">
        <PageHeader title="Förderer" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4 lg:gap-6">
          {mockDonors.map((donor) => (
            <DonorCard
              key={donor.id}
              name={donor.name}
              totalAgreed={donor.totalAgreed}
              totalPaid={donor.totalPaid}
              totalOpen={donor.totalOpen}
              donorId={donor.id}
            />
          ))}
        </div>
      </div>
    </SidebarInset>
  );
}

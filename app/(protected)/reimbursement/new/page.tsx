"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState } from "react";
import { ReimbursementFormUI } from "./ReimbursementFormUI";
import { TravelReimbursementFormUI } from "./TravelReimbursementFormUI";
import { VolunteerAllowanceFormUI } from "./VolunteerAllowanceFormUI";

type ReimbursementType = "expense" | "travel" | "volunteerAllowance";

export default function ReimbursementFormPage() {
  const bankDetailsQuery = useQuery(
    api.reimbursements.queries.getUserBankDetails,
  );
  const [type, setType] = useState<ReimbursementType>("expense");

  const defaultBankDetails = bankDetailsQuery || {
    iban: "",
    bic: "",
    accountHolder: "",
  };

  return (
    <div>
      <PageHeader title="Neue Erstattung" showBackButton />
      <div className="max-w-4xl mx-auto p-6">
        <Tabs
          value={type}
          onValueChange={(v) => setType(v as ReimbursementType)}
        >
          <TabsList>
            <TabsTrigger value="expense">Auslagenerstattung</TabsTrigger>
            <TabsTrigger value="travel">Reisekostenerstattung</TabsTrigger>
            <TabsTrigger value="volunteerAllowance">
              Ehrenamtspauschale
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {type === "travel" && (
        <TravelReimbursementFormUI defaultBankDetails={defaultBankDetails} />
      )}
      {type === "expense" && (
        <ReimbursementFormUI defaultBankDetails={defaultBankDetails} />
      )}
      {type === "volunteerAllowance" && (
        <VolunteerAllowanceFormUI defaultBankDetails={defaultBankDetails} />
      )}
    </div>
  );
}

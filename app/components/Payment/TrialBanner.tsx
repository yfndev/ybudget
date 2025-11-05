import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export function TrialBanner() {
  const organization = useQuery(api.organizations.queries.getUserOrganization);
  const trialEndDate = organization?._creationTime
    ? new Date(organization._creationTime + 14 * 24 * 60 * 60 * 1000)
    : null;
  const daysLeft = trialEndDate
    ? Math.max(
        0,
        Math.ceil((trialEndDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      )
    : 0;

  return (
    <div className="bg-gray-100 py-2 items-center flex justify-center w-full">
      <div className="  mr-60">
        <h2 className=" text-muted-foreground font-medium">
          Dein Trial läuft in {daysLeft} {daysLeft === 1 ? "Tag" : "Tagen"} ab.
        </h2>
      </div>
    </div>
  );
}

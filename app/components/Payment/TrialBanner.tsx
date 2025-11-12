import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export function TrialBanner() {
  const subscription = useQuery(
    api.subscriptions.queries.getSubscriptionStatus,
  );

  if (
    !subscription ||
    subscription.status !== "trial" ||
    !subscription.daysLeftInTrial
  ) {
    return null;
  }

  return (
    <div className="bg-gray-100 py-2 items-center flex justify-center w-full">
      <div className="mr-60">
        <h2 className=" font-medium">
          Dein Trial läuft in {subscription.daysLeftInTrial}
          {subscription.daysLeftInTrial === 1 ? "Tag" : "Tagen"} ab.
        </h2>
      </div>
    </div>
  );
}

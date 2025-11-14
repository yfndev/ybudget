import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { useQuery } from "convex/react";

interface TrialBannerProps {
  onUpgradeClick: () => void;
}

export function TrialBanner({ onUpgradeClick }: TrialBannerProps) {
  const subscription = useQuery(
    api.subscriptions.queries.getSubscriptionStatus,
  );
  const userRole = useCurrentUserRole();

  if (
    !subscription ||
    subscription.status !== "trial" ||
    !subscription.daysLeftInTrial
  ) {
    return null;
  }

  const canUpgrade = userRole === "admin" || userRole === "finance";

  return (
    <div className="bg-gray-100 py-2 items-center flex justify-center w-full ">
      <div className="flex items-center gap-4">
        <p className="text-sm font-medium text-gray-700">
          Dein Trial läuft in {subscription.daysLeftInTrial}
          {subscription.daysLeftInTrial === 1 ? "Tag" : "Tagen"} ab.
        </p>
        {canUpgrade && (
          <Button onClick={onUpgradeClick} size="sm" variant="outline">
            Jetzt upgraden
          </Button>
        )}
      </div>
    </div>
  );
}

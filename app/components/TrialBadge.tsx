"use client";

import { Clock, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useSubscription } from "../hooks/useSubscription";

export function TrialBadge() {
  const { subscriptionAccess, upgradeToProMonthly, isLoading } = useSubscription();

  if (!subscriptionAccess || !subscriptionAccess.hasAccess) return null;

  // Only show for trial users
  if (subscriptionAccess.reason !== "trial") return null;

  const daysRemaining = subscriptionAccess.daysRemaining || 0;

  return (
    <div className="border-b border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-slate-900">
              {daysRemaining === 1
                ? "Last day of trial"
                : `${daysRemaining} days left in trial`}
            </p>
            <p className="text-slate-600">
              Upgrade now to continue using all features
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="shrink-0"
          disabled={isLoading}
          onClick={upgradeToProMonthly}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading ? "Loading..." : "Upgrade Now"}
        </Button>
      </div>
    </div>
  );
}

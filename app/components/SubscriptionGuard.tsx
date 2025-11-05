"use client";

import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CreditCard, Sparkles } from "lucide-react";
import { ReactNode } from "react";
import { useSubscription } from "../hooks/useSubscription";

interface SubscriptionGuardProps {
  children: ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { subscriptionAccess, upgradeToProMonthly, isLoading } = useSubscription();

  if (!subscriptionAccess) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  // Show paywall if no access
  if (!subscriptionAccess.hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {subscriptionAccess.reason === "trial_expired"
                ? "Your Trial Has Ended"
                : "Subscription Required"}
            </CardTitle>
            <CardDescription className="text-base">
              {subscriptionAccess.reason === "trial_expired"
                ? "Continue using YBudget by subscribing to a plan"
                : "Get started with YBudget by choosing a plan"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 shrink-0 text-sky-600" />
                <div className="space-y-1">
                  <p className="font-semibold text-sky-900">
                    Professional Plan
                  </p>
                  <ul className="space-y-1 text-sm text-sky-800">
                    <li>✓ Unbegrenzte Projekte</li>
                    <li>✓ Erweiterte Kategorisierung</li>
                    <li>✓ Steuerliche Zuordnung</li>
                    <li>✓ PDF-Export mit Branding</li>
                    <li>✓ Prioritäts-Support</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={isLoading}
              onClick={upgradeToProMonthly}
            >
              {isLoading ? "Loading..." : "Subscribe Now"}
            </Button>

            <div className="text-center">
              <a
                href="/pricing"
                className="text-sm text-slate-600 hover:text-slate-900 underline"
              >
                View all pricing options
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User has access, render children
  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SubscriptionSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timeout = setTimeout(() => {
      router.push("/");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-green-600">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Welcome to YBudget Pro!
          </CardTitle>
          <CardDescription className="text-base">
            Your subscription is now active
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 shrink-0 text-emerald-600" />
              <div className="space-y-1">
                <p className="font-semibold text-emerald-900">
                  You now have access to:
                </p>
                <ul className="space-y-1 text-sm text-emerald-800">
                  <li>✓ Unbegrenzte Projekte</li>
                  <li>✓ Erweiterte Kategorisierung</li>
                  <li>✓ Steuerliche Zuordnung</li>
                  <li>✓ PDF-Export mit Branding</li>
                  <li>✓ Prioritäts-Support</li>
                  <li>✓ Multi-User (bis 5 Nutzer)</li>
                </ul>
              </div>
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={() => router.push("/")}>
            Go to Dashboard
          </Button>

          <p className="text-center text-xs text-slate-500">
            Redirecting automatically in 5 seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

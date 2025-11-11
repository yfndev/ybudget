"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import { Check } from "lucide-react";
import { type FormEvent, useState } from "react";

export function Paywall() {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");

  const initializePayment = useAction(api.stripe.pay);

  async function handlePayment(event: FormEvent) {
    event.preventDefault();
    const paymentUrl = await initializePayment({ tier: interval });

    if (paymentUrl) {
      window.location.href = paymentUrl;
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl">
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-card-foreground mb-2">
              ⏰ Deine Testphase ist vorbei
            </h2>
            <p className="text-muted-foreground text-sm">
              Abonniere YBudget Premium, um weiterhin alle Features nutzen zu
              können.
            </p>
          </div>

          <div className="mb-8 space-y-3">
            <p className="text-sm font-medium text-card-foreground mb-4">
              Upgraden auf ybudget Premium:
            </p>
            {[
              "Budgets planen in Minuten, nicht Stunden",
              "Transaktionen zuordnen statt suchen",
              "Ausgaben organisieren nach Projekten",
              "Berichte für Förderer in 2 Klicks",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-card-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <form onSubmit={handlePayment}>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:opacity-90"
                size="lg"
              >
                YBudget abonnieren
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}

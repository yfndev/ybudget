"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import { useState } from "react";

interface PaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Paywall({ open, onOpenChange }: PaywallProps) {
  const [isLoading, setIsLoading] = useState(false);
  const initializePayment = useAction(api.stripe.pay);

  async function handleUpgrade() {
    setIsLoading(true);
    const paymentUrl = await initializePayment({ tier: "monthly" });
    if (paymentUrl) {
      window.location.href = paymentUrl;
    }
    setIsLoading(false);
  }

  const user = useQuery(api.users.queries.getCurrentUserProfile);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <DialogTitle className="text-2xl flex flex-col">
              Hey {user?.firstName} :)
              <span className="text-xl">
                Es freut uns, dass dir YBudget gefällt!
              </span>
            </DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Da du bereits 3 Projekte erstellt hast, sind deine kostenlosen
            Projekte aufgebraucht. <br />
            <br /> Falls dir YBudget gefällt und dir Zeit beim Budgeting spart,
            würde es mich freuen, wenn du auf unseren Premium Plan wechseln
            würdest. Dort kannst du unbegrenzt viele Projekte anlegen und sparst
            somit noch mehr Zeit und Nerven beim Planen eurer Budgets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-sm">Mit Premium erhältst du:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✨ Unbegrenzt Projekte</li>
              <li>📊 Unbegrenzte Teams</li>
              <li>🧑‍🧒‍🧒 Unbegrenzte Nutzer</li>
              <li>⚡ Prioritäts-Support</li>
              <li>🎯 Alle zukünftigen Features</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading
              ? "Wird geladen..."
              : "Auf unbegrenzte Projekte upgraden"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            3 Projekte reichen mir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

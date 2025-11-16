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
import { useAction } from "convex/react";
import { Sparkles } from "lucide-react";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <DialogTitle className="text-2xl">
              Hey! Es freut uns, dass dir yBudget gefällt!
            </DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Du hast bereits 3 Projekte erstellt. Um unbegrenzt viele Projekte zu
            erstellen und alle Premium-Features zu nutzen, upgrade bitte auf
            unseren Premium Plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-sm">Mit Premium erhältst du:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✨ Unbegrenzt Projekte</li>
              <li>📊 Erweiterte Berichte</li>
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
            {isLoading ? "Wird geladen..." : "Jetzt upgraden"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Vielleicht später
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

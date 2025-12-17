"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import { useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Paywall({ open, onOpenChange }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const initializePayment = useAction(api.stripe.pay);
  const user = useQuery(api.users.queries.getCurrentUserProfile);

  const handlePayment = async (tier: "monthly" | "yearly") => {
    setIsLoading(true);
    const paymentUrl = await initializePayment({ tier });
    if (paymentUrl) window.location.href = paymentUrl;
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <DialogTitle className="text-2xl flex flex-col">
              Hey {user?.firstName} :)
              <span className="text-xl">Ich hoffe YBudget gefällt dir</span>
            </DialogTitle>
          </div>
          <p className="pt-2  ">
            Du hast deine kostenlosen Projekte aufgebraucht oder möchtest schon
            früher alle YBudget Features nutzen? <br />
            <br /> Dann ist der Premium Plan genau das Richtige für dich. Dort
            kannst du unbegrenzt viele Projekte anlegen und sparst somit noch
            mehr Zeit und Nerven beim Planen eurer Budgets 🙌
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg  space-y-2">
            <p className="font-semibold text-md ">Mit Premium erhältst du:</p>
            <ul className="space-y-1 text-sm ">
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
            onClick={() => handlePayment("yearly")}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            Auf YBudget Yearly upgraden
          </Button>
          <Button
            onClick={() => handlePayment("monthly")}
            disabled={isLoading}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Auf YBudget Monthly upgraden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

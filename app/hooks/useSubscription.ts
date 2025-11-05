"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export function useSubscription() {
  const subscriptionAccess = useQuery(api.subscriptions.functions.checkSubscriptionAccess);
  const generateCheckoutLink = useMutation(api.polar.generateCheckoutLink);
  const [isLoading, setIsLoading] = useState(false);

  const upgradeToProMonthly = async () => {
    setIsLoading(true);
    try {
      const checkoutUrl = await generateCheckoutLink({
        productKey: "premiumMonthly",
        successUrl: `${window.location.origin}/subscription/success`,
      });

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Failed to generate checkout link:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeToProYearly = async () => {
    setIsLoading(true);
    try {
      const checkoutUrl = await generateCheckoutLink({
        productKey: "premiumYearly",
        successUrl: `${window.location.origin}/subscription/success`,
      });

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Failed to generate checkout link:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscriptionAccess,
    upgradeToProMonthly,
    upgradeToProYearly,
    isLoading,
  };
}

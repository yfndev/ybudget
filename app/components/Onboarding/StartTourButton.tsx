"use client";

import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useOnborda } from "onborda";

export function StartTourButton() {
  const { startOnborda } = useOnborda();

  const handleStartTour = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("onborda:main-tour");
    }
    startOnborda("main-tour");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleStartTour}
      title="Tour starten"
      className="h-8 w-8"
    >
      <HelpCircle className="h-4 w-4" />
      <span className="sr-only">Tour starten</span>
    </Button>
  );
}

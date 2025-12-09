"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { X } from "lucide-react";
import type { CardComponentProps } from "onborda";
import { useOnborda } from "onborda";
import { useEffect, useRef } from "react";

export function TourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}: CardComponentProps) {
  const { closeOnborda } = useOnborda();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    card.style.transform = "";

    const adjust = () => {
      const rect = card.getBoundingClientRect();
      const x =
        rect.right > window.innerWidth - 16
          ? window.innerWidth - 16 - rect.right
          : rect.left < 16
            ? 16 - rect.left
            : 0;
      const y =
        rect.bottom > window.innerHeight - 16
          ? window.innerHeight - 16 - rect.bottom
          : rect.top < 80
            ? 80 - rect.top
            : 0;

      if (x || y) card.style.transform = `translate(${x}px, ${y}px)`;
    };

    const t1 = setTimeout(adjust, 50);
    const t2 = setTimeout(adjust, 200);
    const t3 = setTimeout(adjust, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [currentStep]);

  return (
    <Card
      ref={cardRef}
      className="max-w-md shadow-lg"
      style={{ zIndex: 99999 }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {step.icon && <span className="text-2xl">{step.icon}</span>}
            <div>
              <h3 className="font-semibold text-lg leading-tight">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Schritt {currentStep + 1} von {totalSteps}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-1 -mr-1"
            onClick={closeOnborda}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="text-sm leading-relaxed">{step.content}</div>
      </CardContent>

      <CardFooter className="flex justify-between pt-0">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="min-w-24"
        >
          Zurück
        </Button>

        {currentStep + 1 === totalSteps ? (
          <Button onClick={closeOnborda} className="min-w-24">
            Fertig
          </Button>
        ) : (
          <Button onClick={nextStep} className="min-w-24">
            Weiter
          </Button>
        )}
      </CardFooter>

      {arrow}
    </Card>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep + 1 === totalSteps;

  const handleNextStep = () => {
    if (step.nextRoute) {
      router.push(step.nextRoute);
      setTimeout(() => {
        nextStep();
      }, 100);
    } else {
      nextStep();
    }
  };

  useEffect(() => {
    if (!cardRef.current) return;

    const adjustPosition = () => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const paddingSide = 16;
      const paddingTop = 200;
      const paddingBottom = 16;

      let adjustX = 0;
      let adjustY = 0;

      if (rect.right > viewportWidth - paddingSide) {
        adjustX = viewportWidth - paddingSide - rect.right;
      }
      if (rect.left < paddingSide) {
        adjustX = paddingSide - rect.left;
      }
      if (rect.bottom > viewportHeight - paddingBottom) {
        adjustY = viewportHeight - paddingBottom - rect.bottom;
      }
      if (rect.top < paddingTop) {
        adjustY = paddingTop - rect.top;
      }

      if (adjustX !== 0 || adjustY !== 0) {
        card.style.transform = `translate(${adjustX}px, ${adjustY}px)`;
      } else {
        card.style.transform = "";
      }
    };

    const timeoutId = setTimeout(adjustPosition, 50);
    const intervalId = setInterval(adjustPosition, 100);

    const resizeObserver = new ResizeObserver(adjustPosition);
    resizeObserver.observe(cardRef.current);

    window.addEventListener("resize", adjustPosition);
    window.addEventListener("scroll", adjustPosition, true);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", adjustPosition);
      window.removeEventListener("scroll", adjustPosition, true);
    };
  }, [currentStep]);

  return (
    <Card
      ref={cardRef}
      className="max-w-md shadow-lg relative transition-transform"
      style={{ zIndex: 99999 }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {step.icon && <span className="text-2xl">{step.icon}</span>}
            <div className="flex-1">
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
            <span className="sr-only">Tour schließen</span>
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
          disabled={isFirstStep}
          className="min-w-24"
        >
          Zurück
        </Button>

        {isLastStep ? (
          <Button onClick={closeOnborda} className="min-w-24">
            🎉 Fertig!
          </Button>
        ) : (
          <Button onClick={handleNextStep} className="min-w-24">
            Weiter
          </Button>
        )}
      </CardFooter>

      {arrow}
    </Card>
  );
}

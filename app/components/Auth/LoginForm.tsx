"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useAuthActions();

  const handleGoogleSignIn = () => {
    void signIn("google");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="p-8 shadow-lg">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Image
              src="/AppIcon.png"
              alt="YBudget"
              width={32}
              height={32}
              className="size-12"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Willkommen zurück zu YBudget
            </h1>
            <p className="text-muted-foreground">
              Melde dich an, um dein Budget zu verwalten!
            </p>
          </div>

          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full h-12 text-base font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="size-5"
            >
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Mit Google anmelden
          </Button>
        </div>
      </Card>

      <p className="text-center text-sm text-muted-foreground px-6">
        Durch das Klicken auf Weiter stimmst du unseren{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Nutzungsbedingungen
        </a>{" "}
        und{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Datenschutzrichtlinien
        </a>{" "}
        zu.
      </p>
    </div>
  );
}

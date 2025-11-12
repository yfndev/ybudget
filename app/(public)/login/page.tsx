"use client";

import { LoginForm } from "@/components/Auth/LoginForm";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  return (
    <>
      <AuthLoading>
        <div className="bg-muted/30 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="flex min-h-svh">
          <div className="flex-2 flex items-center justify-center px-8 py-16 lg:px-16">
            <div className="w-full max-w-md">
              <LoginForm />
            </div>
          </div>
          <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-16">
            <Image
              src="/LoginIllustration.svg"
              alt="YBudget Illustration"
              width={450}
              height={338}
              className="max-w-full h-auto opacity-80"
              priority
            />
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <AuthenticatedRedirect />
      </Authenticated>
    </>
  );
}

function AuthenticatedRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return null;
}

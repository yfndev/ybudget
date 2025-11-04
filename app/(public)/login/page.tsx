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
          <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-50 to-slate-100 items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src="https://images.pexels.com/photos/7688174/pexels-photo-7688174.jpeg"
                alt="YBudget Team"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md">
              <LoginForm />
            </div>
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

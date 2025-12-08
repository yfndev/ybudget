"use client";

import { LoginForm } from "@/components/Auth/LoginForm";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  return (
    <>
      <AuthLoading>
        <div className="flex min-h-svh items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="flex min-h-svh -mt-24 items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <LoginForm />
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

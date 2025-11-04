"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LandingPage } from "../components/Landing/LandingPage";

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  return <LandingPage />;
}

"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import posthog from "posthog-js";

export function SignOut({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuthActions();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    posthog.capture("user_signed_out");
    posthog.reset();
    await signOut();
  };

  return <span onClick={handleSignOut}>{children}</span>;
}

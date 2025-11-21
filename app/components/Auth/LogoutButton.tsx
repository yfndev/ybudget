"use client";

import { useAuthActions } from "@convex-dev/auth/react";

export function SignOut({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuthActions();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();

    await signOut();
  };

  return <span onClick={handleSignOut}>{children}</span>;
}

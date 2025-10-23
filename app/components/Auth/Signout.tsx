import { useAuthActions } from "@convex-dev/auth/react";

export function SignOut({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuthActions();
  return <button onClick={() => void signOut()}>{children}</button>;
}

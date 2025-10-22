import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - yBudget",
  description: "Create your account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

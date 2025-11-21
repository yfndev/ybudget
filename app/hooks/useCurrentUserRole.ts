import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export type UserRole = "admin" | "lead" | "member";

export function useCurrentUserRole(): UserRole | undefined {
  const user = useQuery(api.users.queries.getCurrentUserProfile);
  return user?.role || "member";
}

export function useCanEdit(): boolean {
  const role = useCurrentUserRole();
  return role === "lead" || role === "admin";
}

export function useIsAdmin(): boolean {
  const role = useCurrentUserRole();
  return role === "admin";
}

export function useCanViewAllTransactions(): boolean {
  const role = useCurrentUserRole();
  return role === "admin";
}

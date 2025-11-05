import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export type UserRole = "admin" | "editor" | "viewer";

export function useCurrentUserRole(): UserRole | undefined {
  const user = useQuery(api.users.queries.getCurrentUserProfile);
  return user?.role || "viewer";
}

export function useCanEdit(): boolean {
  const role = useCurrentUserRole();
  return role === "editor" || role === "admin";
}

export function useIsAdmin(): boolean {
  const role = useCurrentUserRole();
  return role === "admin";
}

import type { UserRole } from "@/lib/db/types";
import type { OrganizationalAccess } from "@/lib/auth/roles";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      organizationId?: string;
      role?: UserRole;
      access?: OrganizationalAccess;
      teamId?: string;
      secondaryTeamId?: string;
      profileImageStorageKey?: string;
      publicProfileCompletedAt?: number;
    } & DefaultSession["user"];
  }

  interface User {
    firstName?: string;
    lastName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    organizationId?: string;
    role?: UserRole;
    access?: OrganizationalAccess;
    teamId?: string;
    secondaryTeamId?: string;
    profileImageStorageKey?: string;
    publicProfileCompletedAt?: number;
  }
}

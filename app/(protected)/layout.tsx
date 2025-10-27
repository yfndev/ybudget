"use client";

import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { AppSidebar } from "../components/Sidebar/AppSidebar";
import { OnboardingDialog } from "../components/Onboarding/OnboardingDialog";
import { SidebarProvider } from "../components/ui/sidebar";
import { DateRangeProvider } from "../contexts/DateRangeContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthLoading>
        <ProtectedContent>{children}</ProtectedContent>
      </AuthLoading>

      <Unauthenticated>
        <UnauthenticatedRedirect />
      </Unauthenticated>

      <Authenticated>
        <ProtectedContent>{children}</ProtectedContent>
      </Authenticated>
    </>
  );
}

function UnauthenticatedRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return null;
}

function ProtectedContent({ children }: { children: React.ReactNode }) {
  const needsOnboarding = useQuery(api.queries.userQueries.needsOnboarding);
  const user = useQuery(api.queries.userQueries.getCurrentUser);


  return (
    <DateRangeProvider>
      <SidebarProvider>
        <AppSidebar />
        {children}
        {user && needsOnboarding === true && (
          <OnboardingDialog 
            open={true} 
            onOpenChange={() => {}}
          />
        )}
      </SidebarProvider>
    </DateRangeProvider>
  );
}

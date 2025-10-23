"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppSidebar } from "../components/Sidebar/AppSidebar";
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
  return (
    <DateRangeProvider>
      <SidebarProvider>
        <AppSidebar />
        {children}
      </SidebarProvider>
    </DateRangeProvider>
  );
}

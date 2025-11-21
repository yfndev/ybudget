"use client";

import { OnboardingDialog } from "@/components/Onboarding/OnboardingDialog";
import { TourCard } from "@/components/Onboarding/TourCard";
import { tourSteps } from "@/components/Onboarding/tourSteps";
import { AppSidebar } from "@/components/Sidebar/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DateRangeProvider } from "@/contexts/DateRangeContext";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { Onborda, OnbordaProvider } from "onborda";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const organizationId = useQuery(api.users.queries.getUserOrganizationId, {});
  const user = useQuery(api.users.queries.getCurrentUserProfile);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const showOnboarding = organizationId === null;

  return (
    <OnbordaProvider>
      <DateRangeProvider>
        <Onborda
          steps={tourSteps}
          showOnborda={false}
          shadowRgb="0,0,0"
          shadowOpacity="0.5"
          cardComponent={TourCard}
        >
          <SidebarProvider>
            <AppSidebar />
            <div className="flex flex-col w-full">
              <div className="p-4 lg:px-6 pb-6 overflow-x-hidden w-full">
                {children}
                {showOnboarding && (
                  <OnboardingDialog open onOpenChange={() => {}} />
                )}
              </div>
            </div>
          </SidebarProvider>
        </Onborda>
      </DateRangeProvider>
    </OnbordaProvider>
  );
}

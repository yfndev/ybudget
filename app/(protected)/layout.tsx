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
import posthog from "posthog-js";
import { memo, useEffect, useState } from "react";

const StableContent = memo(function StableContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const needsOrg = useQuery(api.users.queries.getUserOrganizationId, {});
  const userProfile = useQuery(api.users.queries.getCurrentUserProfile);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (needsOrg === undefined) return;
    if (needsOrg === null) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [needsOrg]);

  useEffect(() => {
    if (userProfile && userProfile._id) {
      posthog.identify(userProfile._id, {
        email: userProfile.email || undefined,
        name: userProfile.name || undefined,
        role: userProfile.role || undefined,
        organizationId: userProfile.organizationId || undefined,
      });
    }
  }, [userProfile]);

  const handleOnboardingChange = (open: boolean) => {
    if (!open) {
      setShowOnboarding(false);
    }
  };

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
                  <OnboardingDialog
                    open={true}
                    onOpenChange={handleOnboardingChange}
                  />
                )}
              </div>
            </div>
          </SidebarProvider>
        </Onborda>
      </DateRangeProvider>
    </OnbordaProvider>
  );
});

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <StableContent>{children}</StableContent>;
}

export default memo(DashboardLayout);

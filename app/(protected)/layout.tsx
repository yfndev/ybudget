"use client";

import { useQuery } from "convex-helpers/react/cache";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { Onborda, OnbordaProvider } from "onborda";
import { memo, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { OnboardingDialog } from "../components/Onboarding/OnboardingDialog";
import { TourCard } from "../components/Onboarding/TourCard";
import { tourSteps } from "../components/Onboarding/tourSteps";
import { AppSidebar } from "../components/Sidebar/AppSidebar";
import { SidebarProvider } from "../components/ui/sidebar";
import { DateRangeProvider } from "../contexts/DateRangeContext";
import { setOnboardingComplete } from "../lib/onboardingStorage";

const StableContent = memo(function StableContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const needsOrg = useQuery(api.users.queries.getUserOrganizationId, {});
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (needsOrg === undefined) return;
    if (needsOrg === null) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [needsOrg]);

  const handleOnboardingChange = (open: boolean) => {
    if (!open) {
      setOnboardingComplete(true);
      setShowOnboarding(false);
    }
  };

  return (
    <OnbordaProvider>
      <DateRangeProvider>
        <SidebarProvider>
          <AppSidebar />
          <Onborda
            steps={tourSteps}
            showOnborda={false}
            shadowRgb="0,0,0"
            shadowOpacity="0.5"
            cardComponent={TourCard}
          >
            <div className="p-4 lg:px-6 pb-6 overflow-x-hidden w-full">
              {children}
              {showOnboarding && (
                <OnboardingDialog
                  open={true}
                  onOpenChange={handleOnboardingChange}
                />
              )}
            </div>
          </Onborda>
        </SidebarProvider>
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

  return <StableContent>{children}</StableContent>;
}

export default memo(DashboardLayout);

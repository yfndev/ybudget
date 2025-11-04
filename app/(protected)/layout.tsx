"use client";

import { useQuery } from "convex-helpers/react/cache";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { memo, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { OnboardingDialog } from "../components/Onboarding/OnboardingDialog";
import { AppSidebar } from "../components/Sidebar/AppSidebar";
import { SidebarProvider } from "../components/ui/sidebar";
import { DateRangeProvider } from "../contexts/DateRangeContext";
import {
  getOnboardingComplete,
  setOnboardingComplete,
} from "../lib/onboardingStorage";

const StableContent = memo(function StableContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const needsOrg = useQuery(api.users.queries.getUserOrganizationId, {});
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (needsOrg === undefined) return;
    if (!needsOrg) {
      setOnboardingComplete(true);
      setShowOnboarding(false);
    } else {
      setShowOnboarding(!getOnboardingComplete());
    }
  }, [needsOrg]);

  const handleOnboardingChange = (open: boolean) => {
    if (!open) {
      setOnboardingComplete(true);
      setShowOnboarding(false);
    }
  };

  return (
    <DateRangeProvider>
      <SidebarProvider>
        <AppSidebar />
        <div className="p-4 lg:px-6 pb-6 overflow-x-hidden w-full">
          {children}
          {showOnboarding && (
            <OnboardingDialog
              open={true}
              onOpenChange={handleOnboardingChange}
            />
          )}
        </div>
      </SidebarProvider>
    </DateRangeProvider>
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

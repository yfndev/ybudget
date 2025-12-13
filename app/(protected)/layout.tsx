"use client";

import { OnboardingDialog } from "@/components/Onboarding/OnboardingDialog";
import { TourCard } from "@/components/Onboarding/TourCard";
import { tourSteps } from "@/components/Onboarding/tourSteps";
import { AppSidebar } from "@/components/Sidebar/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { DateRangeProvider } from "@/lib/contexts/DateRangeContext";
import { useQuery } from "convex-helpers/react/cache";
import { useConvexAuth } from "convex/react";
import Image from "next/image";
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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Image
          src="/AppIcon.png"
          alt="Logo"
          width={48}
          height={48}
          className="animate-spin"
        />
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
              <div className="p-4 lg:px-6 pb-6 w-full">
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

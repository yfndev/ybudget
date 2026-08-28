import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { PostHogIdentity } from "@/components/PostHogIdentity";
import { auth } from "@/lib/auth";
import { normalizeOptionalUserRole } from "@/lib/auth/roles";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { isGettingToKnowConfirmed } from "@/lib/members/gettingToKnow";
import { isUnavailableMemberStatus } from "@/lib/members/status";
import { getMemberPlatformLinkingData } from "@/lib/server/memberPlatform/linking";
import { AppShell } from "./AppShell";
import { MemberPlatformLinking } from "./MemberPlatformLinking";
import { MembershipPendingNotice } from "./MembershipPendingNotice";
import { MembershipOnboarding } from "./membership-onboarding/MembershipOnboarding";
import { OnboardingProvider } from "./membership-onboarding/OnboardingContext";
import { OnboardingSidebarProgress } from "./membership-onboarding/OnboardingSidebarProgress";
import { OffboardedNotice } from "./OffboardedNotice";
import { OnboardingNotice } from "./OnboardingNotice";
import { PublicProfileSetup } from "./PublicProfileSetup";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const member = await requireAuthenticatedUser({
    allowDeletedWorkspaceAccount: true,
  });

  let content: ReactNode;
  if (member.workspaceAccountDeletedAt) {
    content = <OffboardedNotice isAccountDeleted />;
  } else if (isUnavailableMemberStatus(member.memberStatus)) {
    content = <OffboardedNotice />;
  } else if (
    member.publicProfileSetupRequired === true &&
    !member.memberPlatformUserId
  ) {
    content = (
      <PublicProfileSetup
        canUseGooglePhoto={
          member.googlePhotoIsDefault === false && Boolean(member.image)
        }
      />
    );
  } else if (
    member.memberStatus === "onboarding" &&
    !member.memberPlatformUserId
  ) {
    const linkingData = await getMemberPlatformLinkingData(member);
    content = linkingData ? (
      <MemberPlatformLinking data={linkingData} />
    ) : (
      <OnboardingNotice />
    );
  } else if (member.memberStatus === "onboarding") {
    content = (
      <OnboardingProvider>
        <AppShell locked navSlot={<OnboardingSidebarProgress />}>
          <MembershipOnboarding />
        </AppShell>
      </OnboardingProvider>
    );
  } else if (isGettingToKnowConfirmed(member)) {
    content = (
      <AppShell>
        <MembershipPendingNotice />
        {children}
      </AppShell>
    );
  } else {
    content = <AppShell>{children}</AppShell>;
  }

  return (
    <>
      <PostHogIdentity
        userId={member._id}
        organizationId={member.organizationId}
        role={normalizeOptionalUserRole(member.role)}
      />
      {content}
    </>
  );
}

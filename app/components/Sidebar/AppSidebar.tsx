"use client";

import { LayoutDashboard, SquareCheckBig, Upload, Users } from "lucide-react";
import { memo } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { StartTourButton } from "@/components/Onboarding/StartTourButton";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import Image from "next/image";
import Link from "next/link";
import { MainNav } from "./MainNav";
import { ProjectNav } from "./ProjectNav";
import { NavUser } from "./UserNav";

const mainNav = [
  { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { name: "Transaktionen", url: "/transactions", icon: SquareCheckBig },
  { name: "Import", url: "/import", icon: Upload },
  { name: "Förderer", url: "/donors", icon: Users },
];

function AppSidebarComponent(props: React.ComponentProps<typeof Sidebar>) {
  const user = useQuery(api.users.queries.getCurrentUserProfile);

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/AppIcon.png"
                    alt="YBudget"
                    width={48}
                    height={48}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">YBudget</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent>
        <MainNav mainNav={mainNav} id="tour-main-nav" />
        <ProjectNav id="tour-project-nav" />
      </SidebarContent>
      <SidebarFooter className="flex flex-row items-center justify-between">
        <NavUser user={user} />
        <StartTourButton />
      </SidebarFooter>
    </Sidebar>
  );
}

export const AppSidebar = memo(AppSidebarComponent);

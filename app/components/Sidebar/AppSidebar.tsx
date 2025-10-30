"use client";

import {
  LayoutDashboard,
  PiggyBank,
  SquareCheckBig,
  Upload,
  Users,
} from "lucide-react";
import * as React from "react";

import { NavUser } from "@/components/Sidebar/UserNav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Skeleton } from "../ui/skeleton";
import { MainNav } from "./MainNav";
import { ProjectNav } from "./ProjectNav";
import { SearchForm } from "./SearchForm";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  mainNav: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Transaktionen",
      url: "/transactions",
      icon: SquareCheckBig,
    },
    {
      name: "Import",
      url: "/import",
      icon: Upload,
    },
    {
      name: "Förderer",
      url: "/donors",
      icon: Users,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const organizationName = useQuery(
    api.queries.organizations.getOrganizationName
  );
  return (
    <Sidebar variant="sidebar" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <PiggyBank className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">YBudget</span>
                  <span className="truncate font-medium text-xs">
                    {organizationName ?? <Skeleton className="w-10 h-4" />}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <MainNav mainNav={data.mainNav} />
        <ProjectNav />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

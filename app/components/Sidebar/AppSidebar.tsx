"use client";

import {
  LayoutDashboard,
  PiggyBank,
  SquareCheckBig,
  Upload,
  Users,
} from "lucide-react";
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

import { useQuery } from "convex-helpers/react/cache";
import { api } from "../../../convex/_generated/api";
import { MainNav } from "./MainNav";
import { ProjectNav } from "./ProjectNav";
import { SearchForm } from "./SearchForm";
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
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <MainNav mainNav={mainNav} />
        <ProjectNav />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

export const AppSidebar = memo(AppSidebarComponent);

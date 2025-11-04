"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function MainNav({
  mainNav,
  id,
}: {
  mainNav: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
  id?: string;
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden" id={id}>
      <SidebarMenu>
        {mainNav.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

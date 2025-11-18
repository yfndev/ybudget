"use client";
import { SignOut } from "@/components/Auth/LogoutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useAction } from "convex/react";
import {
  ChevronsUpDown,
  CreditCard,
  Folder,
  LogOut,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function NavUser({ user }: { user: Doc<"users"> | null | undefined }) {
  const { isMobile } = useSidebar();
  const isAdmin = user?.role === "admin";
  const createPortalSession = useAction(api.stripe.createCustomerPortalSession);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const handleBillingClick = async () => {
    if (isLoadingPortal) return;

    setIsLoadingPortal(true);
    try {
      const portalUrl = await createPortalSession();
      window.location.href = portalUrl;
    } catch (err) {
      setIsLoadingPortal(false);
      console.error("Failed to create portal session: " + err);
    }
  };

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="grid flex-1 gap-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={user.image}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="rounded-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user.image}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="rounded-lg">
                    {user.name?.charAt(0).toUpperCase() ?? ""}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAdmin && (
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/settings/users">
                    <Users />
                    Benutzer
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/teams">
                    <Folder />
                    Teams
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleBillingClick}
                  disabled={isLoadingPortal}
                >
                  <CreditCard />
                  {isLoadingPortal ? "Laden..." : "Abrechnung"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            )}
            {isAdmin && <DropdownMenuSeparator />}
            <DropdownMenuItem>
              <LogOut />
              <SignOut>Abmelden</SignOut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

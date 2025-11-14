"use client";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useState } from "react";

import { CreateProjectDialog } from "@/components/Sheets/CreateProjectDialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useCanEdit } from "@/hooks/useCurrentUserRole";

function ProjectNavComponent({ id }: { id?: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const pathname = usePathname();
  const projects = useQuery(api.projects.queries.getAllProjects);
  const canEdit = useCanEdit();

  if (projects === undefined) {
    return (
      <SidebarGroup id={id}>
        <SidebarGroupLabel>Projekte</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-2 py-1 text-sm text-muted-foreground">
              Laden...
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  const parentProjects = projects.filter((p: Doc<"projects">) => !p.parentId);

  const items = parentProjects.map((project: Doc<"projects">) => {
    const childProjects = projects.filter(
      (p: Doc<"projects">) => p.parentId === project._id,
    );

    return {
      title: project.name,
      url: `/projects/${project._id}`,
      isActive: pathname === `/projects/${project._id}`,
      items:
        childProjects.length > 0
          ? childProjects.map((child: Doc<"projects">) => ({
              title: child.name,
              url: `/projects/${child._id}`,
            }))
          : undefined,
    };
  });

  return (
    <SidebarGroup id={id}>
      <SidebarGroupLabel>Projekte</SidebarGroupLabel>
      {canEdit && (
        <SidebarGroupAction onClick={() => setDialogOpen(true)}>
          <Plus />
          <span className="sr-only">Projekt hinzufügen</span>
        </SidebarGroupAction>
      )}
      <SidebarMenu>
        {items.map(
          (item: {
            title: string;
            url: string;
            isActive: boolean;
            items?: Array<{ title: string; url: string }>;
          }) => (
            <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
              <SidebarMenuItem>
                {item.items?.length ? (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url}>
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                ) : (
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map(
                          (subItem: { title: string; url: string }) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ),
                        )}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          ),
        )}
      </SidebarMenu>
      {canEdit && (
        <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      )}
    </SidebarGroup>
  );
}

export const ProjectNav = memo(ProjectNavComponent);

"use client";

import { Archive, ChevronRight, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import toast from "react-hot-toast";

import { CreateProjectDialog } from "@/components/Dialogs/CreateProjectDialog";
import { Paywall } from "@/components/Payment/Paywall";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
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
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useCanEdit } from "@/lib/hooks/useCurrentUserRole";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";

export function ProjectNav({ id }: { id?: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"projects"> | null>(null);
  const [editValue, setEditValue] = useState("");

  const pathname = usePathname();
  const projects = useQuery(api.projects.queries.getAllProjects);
  const projectLimits = useQuery(api.subscriptions.queries.getProjectLimits);
  const canEdit = useCanEdit();
  const renameProject = useMutation(api.projects.functions.renameProject);
  const archiveProject = useMutation(api.projects.functions.archiveProject);

  const handleSave = async () => {
    if (!editingId || !editValue.trim()) return;
    try {
      await renameProject({ projectId: editingId, name: editValue.trim() });
      setEditingId(null);
      toast.success("Projekt umbenannt");
    } catch {
      toast.error("Fehler beim Umbenennen");
    }
  };

  const startEdit = (projectId: Id<"projects">, name: string) => {
    if (!canEdit) return;
    setEditingId(projectId);
    setEditValue(name);
  };

  const handleArchive = async (projectId: Id<"projects">) => {
    try {
      await archiveProject({ projectId });
      toast.success("Projekt archiviert");
    } catch {
      toast.error("Fehler beim Archivieren");
    }
  };

  if (!projects) {
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

  const parentProjects = projects.filter((p) => !p.parentId);
  const countText =
    projectLimits && !projectLimits.isPremium
      ? `(${projectLimits.currentProjects}/${projectLimits.maxProjects})`
      : "";

  return (
    <SidebarGroup id={id}>
      <div className="flex items-center justify-between ">
        <SidebarGroupLabel className="font-bold text-sm text-foreground">
          Departments / Projekte
        </SidebarGroupLabel>
        {canEdit && countText && (
          <span className="text-xs pr-5 text-muted-foreground">
            {countText}
          </span>
        )}
      </div>
      {canEdit && (
        <SidebarGroupAction
          onClick={() =>
            projectLimits?.canCreateMore
              ? setDialogOpen(true)
              : setPaywallOpen(true)
          }
        >
          <Plus />
          <span className="sr-only">Projekt hinzufügen</span>
        </SidebarGroupAction>
      )}
      <SidebarMenu>
        {parentProjects.map((project) => {
          const children = projects.filter((p) => p.parentId === project._id);
          const isActive = pathname === `/projects/${project._id}`;
          const isEditing = editingId === project._id;

          return (
            <Collapsible key={project._id} asChild defaultOpen>
              <SidebarMenuItem>
                {isEditing ? (
                  <EditInput
                    value={editValue}
                    onChange={setEditValue}
                    onSave={handleSave}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <ProjectContextMenu
                    canEdit={canEdit}
                    onRename={() => startEdit(project._id, project.name)}
                    onArchive={() => handleArchive(project._id)}
                  >
                    <SidebarMenuButton
                      asChild
                      tooltip={project.name}
                      isActive={isActive}
                    >
                      <Link href={`/projects/${project._id}`}>
                        <span
                          className={
                            children.length ? "font-medium" : undefined
                          }
                          onDoubleClick={(e) => {
                            e.preventDefault();
                            startEdit(project._id, project.name);
                          }}
                        >
                          {project.name}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </ProjectContextMenu>
                )}
                {children.length > 0 && (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90 w-6 h-6">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {children.map((child) => {
                          const isChildEditing = editingId === child._id;

                          return (
                            <SidebarMenuSubItem key={child._id}>
                              {isChildEditing ? (
                                <EditInput
                                  value={editValue}
                                  onChange={setEditValue}
                                  onSave={handleSave}
                                  onCancel={() => setEditingId(null)}
                                />
                              ) : (
                                <ProjectContextMenu
                                  canEdit={canEdit}
                                  onRename={() =>
                                    startEdit(child._id, child.name)
                                  }
                                  onArchive={() => handleArchive(child._id)}
                                >
                                  <SidebarMenuSubButton asChild>
                                    <Link href={`/projects/${child._id}`}>
                                      <span
                                        onDoubleClick={(e) => {
                                          e.preventDefault();
                                          startEdit(child._id, child.name);
                                        }}
                                      >
                                        {child.name}
                                      </span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </ProjectContextMenu>
                              )}
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
      {canEdit && (
        <>
          <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
          <Paywall open={paywallOpen} onOpenChange={setPaywallOpen} />
        </>
      )}
    </SidebarGroup>
  );
}

function EditInput({
  value,
  onChange,
  onSave,
  onCancel,
}: {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="px-2 py-1.5">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave();
          if (e.key === "Escape") onCancel();
        }}
        onBlur={onSave}
        autoFocus
      />
    </div>
  );
}

function ProjectContextMenu({
  children,
  canEdit,
  onRename,
  onArchive,
}: {
  children: ReactNode;
  canEdit: boolean;
  onRename: () => void;
  onArchive: () => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      {canEdit && (
        <ContextMenuContent>
          <ContextMenuItem onClick={onRename}>
            <Pencil className="mr-2 h-4 w-4" />
            Umbenennen
          </ContextMenuItem>
          <ContextMenuItem onClick={onArchive}>
            <Archive className="mr-2 h-4 w-4" />
            Archivieren
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}

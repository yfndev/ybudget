"use client";

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
import { useMutation, useQuery } from "convex/react";
import { Archive, ChevronRight, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import toast from "react-hot-toast";

type Project = NonNullable<
  ReturnType<typeof useQuery<typeof api.projects.queries.getAllProjects>>
>[number];

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
    } catch (error) {
      toast.error("Du darfst dieses Projekt nicht archivieren");
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

  const parentProjects = projects.filter((project) => !project.parentId);
  const getChildren = (parentId: Id<"projects">) =>
    projects.filter((project) => project.parentId === parentId);
  const countText =
    projectLimits && !projectLimits.isPremium
      ? `(${projectLimits.currentProjects}/${projectLimits.maxProjects})`
      : "";

  const renderProjectItem = (project: Project, isSubItem: boolean) => {
    const isEditing = editingId === project._id;
    const children = getChildren(project._id);
    const hasChildren = children.length > 0;

    if (isEditing) {
      return (
        <EditInput
          value={editValue}
          onChange={setEditValue}
          onSave={handleSave}
          onCancel={() => setEditingId(null)}
        />
      );
    }

    const content = (
      <span
        className={hasChildren && !isSubItem ? "font-medium" : undefined}
        onDoubleClick={(e) => {
          e.preventDefault();
          startEdit(project._id, project.name);
        }}
      >
        {project.name}
      </span>
    );

    const link = <Link href={`/projects/${project._id}`}>{content}</Link>;

    return (
      <ProjectContextMenu
        canEdit={canEdit}
        onRename={() => startEdit(project._id, project.name)}
        onArchive={() => handleArchive(project._id)}
      >
        {isSubItem ? (
          <SidebarMenuSubButton asChild>{link}</SidebarMenuSubButton>
        ) : (
          <SidebarMenuButton
            asChild
            tooltip={project.name}
            isActive={pathname === `/projects/${project._id}`}
          >
            {link}
          </SidebarMenuButton>
        )}
      </ProjectContextMenu>
    );
  };

  return (
    <SidebarGroup id={id}>
      <div className="flex items-center justify-between">
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
          const children = getChildren(project._id);
          return (
            <Collapsible key={project._id} asChild defaultOpen>
              <SidebarMenuItem>
                {renderProjectItem(project, false)}
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
                        {children.map((child) => (
                          <SidebarMenuSubItem key={child._id}>
                            {renderProjectItem(child, true)}
                          </SidebarMenuSubItem>
                        ))}
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

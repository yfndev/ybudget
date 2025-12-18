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
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
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
import { Archive, ChevronRight, FolderInput, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type Project = NonNullable<
  ReturnType<typeof useQuery<typeof api.projects.queries.getAllProjects>>
>[number];

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
  const moveProject = useMutation(api.projects.functions.moveProject);

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

  const handleArchive = async (projectId: Id<"projects">) => {
    try {
      await archiveProject({ projectId });
      toast.success("Projekt archiviert");
    } catch {
      toast.error("Du darfst dieses Projekt nicht archivieren");
    }
  };

  const handleMove = async (
    projectId: Id<"projects">,
    newParentId: Id<"projects"> | null
  ) => {
    try {
      await moveProject({ projectId, newParentId });
      toast.success("Projekt verschoben");
    } catch {
      toast.error("Fehler beim Verschieben");
    }
  };

  const startEdit = (projectId: Id<"projects">, name: string) => {
    if (!canEdit) return;
    setEditingId(projectId);
    setEditValue(name);
  };

  const handleAddClick = () => {
    if (projectLimits?.canCreateMore) {
      setDialogOpen(true);
    } else {
      setPaywallOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setEditingId(null);
  };

  const renderEditInput = () => (
    <div className="px-2 py-1.5">
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        autoFocus
      />
    </div>
  );

  const renderMoveMenu = (
    project: Project,
    availableDepartments: Project[]
  ) => {
    if (availableDepartments.length === 0) return null;
    if (getChildren(project._id).length > 0) return null;

    return (
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <FolderInput className="mr-2 h-4 w-4" />
          Verschieben nach
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          {project.parentId && (
            <ContextMenuItem onClick={() => handleMove(project._id, null)}>
              Kein Department
            </ContextMenuItem>
          )}
          {availableDepartments.map((dept) => (
            <ContextMenuItem
              key={dept._id}
              onClick={() => handleMove(project._id, dept._id)}
            >
              {dept.name}
            </ContextMenuItem>
          ))}
        </ContextMenuSubContent>
      </ContextMenuSub>
    );
  };

  const renderProjectLink = (project: Project, isSubItem: boolean) => {
    const hasChildren = getChildren(project._id).length > 0;
    const isReserves = project.name === "Rücklagen" && !project.parentId;

    const handleDoubleClick = isReserves
      ? undefined
      : (e: React.MouseEvent) => {
          e.preventDefault();
          startEdit(project._id, project.name);
        };

    const className = isReserves
      ? "text-gray-400"
      : hasChildren && !isSubItem
        ? "font-semibold"
        : undefined;

    const content = (
      <span className={className} onDoubleClick={handleDoubleClick}>
        {project.name}
      </span>
    );

    const link = <Link href={`/projects/${project._id}`}>{content}</Link>;

    if (isSubItem) {
      return <SidebarMenuSubButton asChild>{link}</SidebarMenuSubButton>;
    }

    return (
      <SidebarMenuButton
        asChild
        tooltip={project.name}
        isActive={pathname === `/projects/${project._id}`}
      >
        {link}
      </SidebarMenuButton>
    );
  };

  const renderContextMenu = (project: Project, isSubItem: boolean) => {
    const isReserves = project.name === "Rücklagen" && !project.parentId;
    const availableDepartments = parentProjects.filter(
      (dept) => dept._id !== project.parentId && dept.name !== "Rücklagen"
    );

    if (isReserves) return renderProjectLink(project, isSubItem);

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {renderProjectLink(project, isSubItem)}
        </ContextMenuTrigger>
        {canEdit && (
          <ContextMenuContent>
            <ContextMenuItem
              onClick={() => startEdit(project._id, project.name)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Umbenennen
            </ContextMenuItem>
            {renderMoveMenu(project, availableDepartments)}
            <ContextMenuItem onClick={() => handleArchive(project._id)}>
              <Archive className="mr-2 h-4 w-4" />
              Archivieren
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>
    );
  };

  const renderProject = (project: Project, isSubItem: boolean) => {
    if (editingId === project._id) return renderEditInput();
    return renderContextMenu(project, isSubItem);
  };

  const renderChildren = (parentId: Id<"projects">) => {
    const children = getChildren(parentId);
    if (children.length === 0) return null;

    return (
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
                {renderProject(child, true)}
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </>
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
        <SidebarGroupAction onClick={handleAddClick}>
          <Plus />
          <span className="sr-only">Projekt hinzufügen</span>
        </SidebarGroupAction>
      )}

      <SidebarMenu>
        {parentProjects.map((project) => (
          <Collapsible key={project._id} asChild defaultOpen>
            <SidebarMenuItem>
              {renderProject(project, false)}
              {renderChildren(project._id)}
            </SidebarMenuItem>
          </Collapsible>
        ))}
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

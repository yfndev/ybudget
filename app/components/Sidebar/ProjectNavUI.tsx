import type { Id } from "@/convex/_generated/dataModel";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

import { CreateProjectDialog } from "@/components/Dialogs/CreateProjectDialog";
import { Paywall } from "@/components/Payment/Paywall";
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
import { Input } from "../ui/input";

function EditableProjectName({
  isEditing,
  editValue,
  setEditValue,
  saveEdit,
  cancelEdit,
}: {
  isEditing: boolean;
  editValue: string;
  setEditValue: (value: string) => void;
  saveEdit: () => void;
  cancelEdit: () => void;
}) {
  if (!isEditing) return null;

  return (
    <div className="px-2 py-1.5">
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") saveEdit();
          if (e.key === "Escape") cancelEdit();
        }}
        onBlur={saveEdit}
        autoFocus
      />
    </div>
  );
}

export type ProjectItem = {
  id: Id<"projects">;
  name: string;
  url: string;
  isActive: boolean;
  children: Array<{
    id: Id<"projects">;
    name: string;
    url: string;
  }>;
};

export function ProjectNavUI({
  id,
  dialogOpen,
  setDialogOpen,
  paywallOpen,
  setPaywallOpen,
  editingId,
  setEditingId,
  editValue,
  setEditValue,
  projectLimits,
  canEdit,
  items,
  countText,
  saveEdit,
  startEdit,
  isLoading,
}: {
  id?: string;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  paywallOpen: boolean;
  setPaywallOpen: (open: boolean) => void;
  editingId: Id<"projects"> | null;
  setEditingId: (id: Id<"projects"> | null) => void;
  editValue: string;
  setEditValue: (value: string) => void;
  projectLimits: { canCreateMore: boolean } | undefined;
  canEdit: boolean;
  items: ProjectItem[];
  countText: string;
  saveEdit: () => void;
  startEdit: (projectId: Id<"projects">, name: string) => void;
  isLoading: boolean;
}) {
  if (isLoading) {
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

  return (
    <SidebarGroup id={id}>
      <div className="flex items-center justify-between px-2">
        <SidebarGroupLabel className="font-semibold">
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
        {items.map((item) => (
          <Collapsible key={item.id} asChild defaultOpen={true}>
            <SidebarMenuItem>
              <EditableProjectName
                isEditing={editingId === item.id}
                editValue={editValue}
                setEditValue={setEditValue}
                saveEdit={saveEdit}
                cancelEdit={() => setEditingId(null)}
              />
              {editingId !== item.id && (
                <SidebarMenuButton asChild tooltip={item.name}>
                  <Link href={item.url}>
                    <span
                      className={item.children.length ? "font-medium" : undefined}
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        startEdit(item.id, item.name);
                      }}
                    >
                      {item.name}
                    </span>
                  </Link>
                </SidebarMenuButton>
              )}
              {item.children.length > 0 && (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90 w-6 h-6">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children.map((child) => (
                        <SidebarMenuSubItem key={child.id}>
                          <EditableProjectName
                            isEditing={editingId === child.id}
                            editValue={editValue}
                            setEditValue={setEditValue}
                            saveEdit={saveEdit}
                            cancelEdit={() => setEditingId(null)}
                          />
                          {editingId !== child.id && (
                            <SidebarMenuSubButton asChild>
                              <Link href={child.url}>
                                <span
                                  onDoubleClick={(e) => {
                                    e.preventDefault();
                                    startEdit(child.id, child.name);
                                  }}
                                >
                                  {child.name}
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          )}
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              )}
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

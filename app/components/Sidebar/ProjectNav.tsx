"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { useCanEdit } from "@/hooks/useCurrentUserRole";
import { ProjectNavUI, type ProjectItem } from "./ProjectNavUI";

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

  const handleEdit = (projectId: Id<"projects">, name: string) => {
    if (!canEdit) return;
    setEditingId(projectId);
    setEditValue(name);
  };

  const items: ProjectItem[] = projects
    ? projects
        .filter((p) => !p.parentId)
        .map((project) => ({
          id: project._id,
          name: project.name,
          url: `/projects/${project._id}`,
          isActive: pathname === `/projects/${project._id}`,
          children: projects
            .filter((p) => p.parentId === project._id)
            .map((child) => ({
              id: child._id,
              name: child.name,
              url: `/projects/${child._id}`,
            })),
        }))
    : [];

  const countText =
    projectLimits && !projectLimits.isPremium
      ? `(${projectLimits.currentProjects}/${projectLimits.maxProjects})`
      : "";

  return (
    <ProjectNavUI
      id={id}
      dialogOpen={dialogOpen}
      setDialogOpen={setDialogOpen}
      paywallOpen={paywallOpen}
      setPaywallOpen={setPaywallOpen}
      editingId={editingId}
      setEditingId={setEditingId}
      editValue={editValue}
      setEditValue={setEditValue}
      projectLimits={projectLimits}
      canEdit={canEdit}
      items={items}
      countText={countText}
      saveEdit={handleSave}
      startEdit={handleEdit}
      isLoading={!projects}
    />
  );
}

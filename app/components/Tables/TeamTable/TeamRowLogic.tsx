import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import TeamRowUI from "./TeamRowUI";

export default function TeamRow({ team }: { team: Doc<"teams"> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(team.name);

  const allProjects = useQuery(api.projects.queries.getAllOrganizationProjects);
  const assignProject = useMutation(api.teams.functions.assignProjectToTeam);
  const removeProject = useMutation(api.teams.functions.removeProjectFromTeam);
  const renameTeam = useMutation(api.teams.functions.renameTeam);

  const handleToggleProject = async (projectId: Id<"projects">) => {
    try {
      if (team.projectIds?.includes(projectId)) {
        await removeProject({ teamId: team._id, projectId });
        toast.success("Projekt entfernt");
      } else {
        await assignProject({ teamId: team._id, projectId });
        toast.success("Projekt zugewiesen");
      }
    } catch {
      toast.error("Fehler beim Ändern der Projekt-Zuweisung");
    }
  };

  const handleSave = async () => {
    const trimmedName = editedName.trim();
    if (trimmedName === team.name) {
      setIsEditing(false);
      return;
    }

    try {
      await renameTeam({ teamId: team._id, name: trimmedName });
      toast.success("Team umbenannt");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Fehler beim Umbenennen",
      );
      setEditedName(team.name);
    } finally {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditedName(team.name);
      setIsEditing(false);
    }
  };

  return (
    <TeamRowUI
      team={team}
      isEditing={isEditing}
      editedName={editedName}
      setEditedName={setEditedName}
      startEditing={() => setIsEditing(true)}
      handleSave={handleSave}
      handleKeyDown={handleKeyDown}
      allProjects={allProjects || []}
      handleToggleProject={handleToggleProject}
    />
  );
}

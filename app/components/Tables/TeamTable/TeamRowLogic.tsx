import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import TeamTableUI from "./TeamRowUI";
import TeamRowUI from "./TeamRowUI";

export default function TeamRow({ team }: { team: Doc<"teams"> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(team.name);

  const teamMembers = useQuery(api.teams.queries.getTeamMembers, {
    teamId: team._id,
  });
  const allProjects = useQuery(api.projects.queries.getAllOrganizationProjects);
  const teamProjects = useQuery(api.teams.queries.getTeamProjects, {
    teamId: team._id,
  });
  const assignProject = useMutation(api.teams.functions.assignProjectToTeam);
  const removeProjectFromTeam = useMutation(
    api.teams.functions.removeProjectFromTeam,
  );
  const renameTeam = useMutation(api.teams.functions.renameTeam);

  const projectAssignmentMap = new Map(
    teamProjects?.map((p: any) => [p._id, p.assignmentId]) || [],
  );

  const handleToggleProject = async (projectId: Id<"projects">) => {
    const assignmentId = projectAssignmentMap.get(projectId);
    try {
      if (assignmentId) {
        await removeProjectFromTeam({ teamProjectId: assignmentId });
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

    if (!trimmedName) {
      toast.error("Team-Name darf nicht leer sein");
      setEditedName(team.name);
      setIsEditing(false);
      return;
    }

    if (trimmedName === team.name) {
      setIsEditing(false);
      return;
    }

    try {
      await renameTeam({ teamId: team._id, name: trimmedName });
      toast.success("Team umbenannt");
      setIsEditing(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Fehler beim Umbenennen",
      );
      setEditedName(team.name);
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
      teamMembers={teamMembers || []}
      allProjects={allProjects || []}
      assignedProjectIds={projectAssignmentMap}
      handleToggleProject={handleToggleProject}
    />
  );
}

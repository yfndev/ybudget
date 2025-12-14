import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function TeamRow({ team }: { team: Doc<"teams"> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(team.name);

  const allProjects = useQuery(api.projects.queries.getAllProjects);
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
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditedName(team.name);
      setIsEditing(false);
    }
  };

  return (
    <TableRow>
      <TableCell className="pl-6" onDoubleClick={() => setIsEditing(true)}>
        {isEditing ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <span className="font-medium cursor-pointer hover:text-primary transition-colors">
            {team.name}
          </span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">
          {team.memberIds?.length || 0} Mitglieder
        </Badge>
      </TableCell>
      <TableCell className="pr-6">
        <div className="flex flex-wrap gap-2">
          {allProjects?.length ? (
            allProjects.map((project) => (
              <Badge
                key={project._id}
                variant={
                  team.projectIds?.includes(project._id) ? "default" : "outline"
                }
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleToggleProject(project._id)}
              >
                {project.name}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              Keine Projekte
            </span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { Doc, Id } from "@/convex/_generated/dataModel";

interface TeamRowUIProps {
  team: Doc<"teams">;
  isEditing: boolean;
  editedName: string;
  setEditedName: (name: string) => void;
  startEditing: () => void;
  handleSave: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  allProjects: Doc<"projects">[];
  handleToggleProject: (projectId: Id<"projects">) => void;
}

export default function TeamRowUI({
  team,
  isEditing,
  editedName,
  setEditedName,
  startEditing,
  handleSave,
  handleKeyDown,
  allProjects,
  handleToggleProject,
}: TeamRowUIProps) {
  return (
    <TableRow>
      <TableCell className="pl-6" onDoubleClick={startEditing}>
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
          {allProjects.length ? (
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

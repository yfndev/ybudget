"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { AccessDenied } from "@/components/Settings/AccessDenied";
import { CreateProjectDialog } from "@/components/Sheets/CreateProjectDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useIsAdmin } from "@/hooks/useCurrentUserRole";
import { useMutation, useQuery } from "convex/react";
import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function TeamsPage() {
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const teams = useQuery(api.teams.functions.getAllTeams);
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return <AccessDenied title="Teams & Projekte" />;
  }

  return (
    <div>
      <PageHeader title="Teams & Projekte" />

      <div className="space-y-6">
        <p className="text-muted-foreground">
          Verwalte Teams und deren Projekt-Zugriffe
        </p>

        {!teams || teams.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Keine Teams gefunden</h3>
            <p className="text-muted-foreground mt-2">
              Erstelle Teams auf der Benutzer-Seite
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Team
                    </div>
                  </TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Mitglieder</TableHead>
                  <TableHead className="pr-6">
                    <div className="flex items-center gap-2">
                      Projekte
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setCreateProjectDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TeamRow key={team._id} team={team} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={createProjectDialogOpen}
        onOpenChange={setCreateProjectDialogOpen}
      />
    </div>
  );
}

function TeamRow({ team }: { team: any }) {
  const teamMembers = useQuery(api.teams.functions.getTeamMembers, {
    teamId: team._id,
  });
  const allProjects = useQuery(api.projects.queries.getAllOrganizationProjects);
  const teamProjects = useQuery(api.teams.functions.getTeamProjects, {
    teamId: team._id,
  });
  const assignProject = useMutation(api.teams.functions.assignProjectToTeam);
  const removeProjectFromTeam = useMutation(
    api.teams.functions.removeProjectFromTeam
  );

  const assignedProjectIds = new Set(
    teamProjects?.map((p: any) => p._id) || []
  );
  const projectAssignmentMap = new Map(
    teamProjects?.map((p: any) => [p._id, p.assignmentId]) || []
  );

  const handleToggleProject = async (projectId: Id<"projects">) => {
    try {
      if (assignedProjectIds.has(projectId)) {
        const assignmentId = projectAssignmentMap.get(projectId);
        if (assignmentId) {
          await removeProjectFromTeam({ teamProjectId: assignmentId });
          toast.success("Projekt entfernt");
        }
      } else {
        await assignProject({ teamId: team._id, projectId });
        toast.success("Projekt zugewiesen");
      }
    } catch (error) {
      toast.error("Fehler beim Ändern der Projekt-Zuweisung");
    }
  };

  return (
    <TableRow>
      <TableCell className="pl-6">
        <span className="font-medium">{team.name}</span>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {team.description || "Keine Beschreibung"}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{teamMembers?.length || 0} Mitglieder</Badge>
      </TableCell>
      <TableCell className="pr-6">
        <div className="flex flex-wrap gap-2">
          {allProjects?.length ? (
            allProjects.map((project) => {
              const isAssigned = assignedProjectIds.has(project._id);
              return (
                <Badge
                  key={project._id}
                  variant={isAssigned ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleToggleProject(project._id)}
                >
                  {project.name}
                </Badge>
              );
            })
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

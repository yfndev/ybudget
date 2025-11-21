"use client";

import { CreateProjectDialog } from "@/components/Dialogs/CreateProjectDialog";
import { CreateTeamDialog } from "@/components/Dialogs/CreateTeamDialog";
import { PageHeader } from "@/components/Layout/PageHeader";
import { AccessDenied } from "@/components/Settings/AccessDenied";
import TeamRow from "@/components/Tables/TeamTable/TeamRowLogic";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { useIsAdmin } from "@/hooks/useCurrentUserRole";
import { useQuery } from "convex/react";
import { Plus, Users } from "lucide-react";
import { useState } from "react";

export default function TeamsPage() {
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);
  const teams = useQuery(api.teams.queries.getAllTeams);
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return <AccessDenied title="Teams & Projekte" />;
  }

  return (
    <div>
      <PageHeader title="Teams & Projekte" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Verwalte Teams und deren Projekt-Zugriffe
          </p>
          <Button onClick={() => setCreateTeamDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neues Team
          </Button>
        </div>

        {!teams || teams.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Keine Teams gefunden</h3>
            <p className="text-muted-foreground mt-2">
              Erstelle dein erstes Team, um loszulegen
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
      <CreateTeamDialog
        open={createTeamDialogOpen}
        onOpenChange={setCreateTeamDialogOpen}
      />
    </div>
  );
}

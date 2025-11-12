"use client";

import { CreateTeamDialog } from "@/components/dialogs/CreateTeamDialog";
import { PageHeader } from "@/components/Layout/PageHeader";
import { AccessDenied } from "@/components/Settings/AccessDenied";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { getInitials } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { Plus, Shield, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

type UserRole = "admin" | "finance" | "editor" | "viewer";

export default function UsersPage() {
  const users = useQuery(api.users.queries.listOrganizationUsers);
  const isAdmin = useIsAdmin();
  const updateUserRole = useMutation(api.users.functions.updateUserRole);

  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);

  const handleRoleChange = async (userId: Id<"users">, role: UserRole) => {
    try {
      await updateUserRole({ userId, role });
      toast.success("Rolle erfolgreich aktualisiert");
    } catch (error) {
      toast.error(
        "Fehler beim Aktualisieren der Rolle. Mindestens ein Admin ist erforderlich.",
      );
    }
  };

  if (!isAdmin) {
    return <AccessDenied title="Benutzer" />;
  }

  return (
    <div>
      <PageHeader title="Benutzer & Teams" />

      <div className="space-y-6">
        <p className="text-muted-foreground">
          Verwalte Benutzer, deren Organisation-Rollen und Team-Zugehörigkeiten
        </p>

        {!users || users.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              Keine Benutzer gefunden
            </h3>
            <p className="text-muted-foreground mt-2">
              Noch keine Benutzer in deiner Organisation.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Benutzer</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Org-Rolle</TableHead>
                  <TableHead className="pr-6">
                    <div className="flex items-center gap-2">
                      Teams
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setCreateTeamDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <UserRow
                    key={user._id}
                    user={user}
                    onRoleChange={handleRoleChange}
                    isAdmin={isAdmin}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <CreateTeamDialog
        open={createTeamDialogOpen}
        onOpenChange={setCreateTeamDialogOpen}
      />
    </div>
  );
}

function UserRow({
  user,
  onRoleChange,
  isAdmin,
}: {
  user: any;
  onRoleChange: (userId: Id<"users">, role: UserRole) => void;
  isAdmin: boolean;
}) {
  const allTeams = useQuery(api.teams.queries.getAllTeams);
  const userTeamMemberships = useQuery(
    api.teams.queries.getUserTeamMemberships,
    { userId: user._id },
  );
  const addTeamMember = useMutation(api.teams.functions.addTeamMember);
  const removeTeamMember = useMutation(api.teams.functions.removeTeamMember);

  const assignedTeamIds = new Set(
    userTeamMemberships?.map((m: any) => m.teamId) || [],
  );
  const teamMembershipMap = new Map(
    userTeamMemberships?.map((m: any) => [m.teamId, m._id]) || [],
  );

  const handleToggleTeam = async (teamId: Id<"teams">) => {
    try {
      if (assignedTeamIds.has(teamId)) {
        const membershipId = teamMembershipMap.get(teamId);
        if (membershipId) {
          await removeTeamMember({ membershipId });
          toast.success("Aus Team entfernt");
        }
      } else {
        await addTeamMember({ teamId, userId: user._id, role: "viewer" });
        toast.success("Zum Team hinzugefügt");
      }
    } catch (error) {
      toast.error("Fehler beim Ändern der Team-Zugehörigkeit");
    }
  };

  return (
    <TableRow>
      <TableCell className="pl-6">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.image} />
            <AvatarFallback>
              {getInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">
            {user.name || "Unbekannter Benutzer"}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {user.email || "Keine E-Mail"}
      </TableCell>
      <TableCell>
        <Select
          value={user.role}
          onValueChange={(value) => onRoleChange(user._id, value as UserRole)}
          disabled={!isAdmin}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </div>
            </SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="pr-6">
        <div className="flex flex-wrap gap-2">
          {allTeams && allTeams.length > 0 ? (
            allTeams.map((team) => {
              const isAssigned = assignedTeamIds.has(team._id);
              return (
                <Badge
                  key={team._id}
                  variant={isAssigned ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleToggleTeam(team._id)}
                >
                  {team.name}
                </Badge>
              );
            })
          ) : (
            <span className="text-sm text-muted-foreground">Keine Teams</span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

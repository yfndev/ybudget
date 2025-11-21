import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UserRole } from "@/convex/users/permissions";
import { useMutation, useQuery } from "convex/react";
import posthog from "posthog-js";
import { toast } from "react-hot-toast";
import UserRowUI from "./UserRowUI";

interface UserRowProps {
  user: {
    _id: Id<"users">;
    name?: string;
    email?: string;
    image?: string;
    role: UserRole;
  };
  onRoleChange: (userId: Id<"users">, role: UserRole) => void;
  isAdmin: boolean;
}

export default function UserRow({ user, onRoleChange, isAdmin }: UserRowProps) {
  const allTeams = useQuery(api.teams.queries.getAllTeams);
  const userTeams = useQuery(api.teams.queries.getUserTeams, {
    userId: user._id,
  });
  const addTeamMember = useMutation(api.teams.functions.addTeamMember);
  const removeTeamMember = useMutation(api.teams.functions.removeTeamMember);

  const assignedTeamIds = new Set(userTeams?.map((t) => t.teamId) || []);

  const handleToggleTeam = async (teamId: Id<"teams">) => {
    try {
      const isAssigned = assignedTeamIds.has(teamId);

      if (isAssigned) {
        await removeTeamMember({ teamId, userId: user._id });
        toast.success("Aus Team entfernt");
      } else {
        await addTeamMember({ teamId, userId: user._id });
        posthog.capture("team_member_added", {
          timestamp: new Date().toISOString(),
        });
        toast.success("Zum Team hinzugefügt");
      }
    } catch (error) {
      posthog.captureException(error as Error);
      toast.error("Fehler beim Ändern der Team-Zugehörigkeit");
    }
  };

  return (
    <UserRowUI
      user={user}
      onRoleChange={onRoleChange}
      isAdmin={isAdmin}
      allTeams={allTeams || []}
      assignedTeamIds={assignedTeamIds}
      handleToggleTeam={handleToggleTeam}
    />
  );
}

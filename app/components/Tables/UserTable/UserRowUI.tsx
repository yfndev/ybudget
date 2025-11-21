import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { Id } from "@/convex/_generated/dataModel";
import { UserRole } from "@/convex/users/permissions";
import { getInitials } from "@/lib/getInitials";
import { Shield } from "lucide-react";

interface UserRowUIProps {
  user: {
    _id: Id<"users">;
    name?: string;
    email?: string;
    image?: string;
    role: UserRole;
  };
  onRoleChange: (userId: Id<"users">, role: UserRole) => void;
  isAdmin: boolean;
  allTeams: Array<{ _id: Id<"teams">; name: string }>;
  assignedTeamIds: Set<Id<"teams">>;
  handleToggleTeam: (teamId: Id<"teams">) => void;
}

export default function UserRowUI({
  user,
  onRoleChange,
  isAdmin,
  allTeams,
  assignedTeamIds,
  handleToggleTeam,
}: UserRowUIProps) {
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
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="pr-6">
        <div className="flex flex-wrap gap-2">
          {allTeams.length > 0 ? (
            allTeams.map((team) => (
              <Badge
                key={team._id}
                variant={assignedTeamIds.has(team._id) ? "default" : "outline"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleToggleTeam(team._id)}
              >
                {team.name}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">Keine Teams</span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

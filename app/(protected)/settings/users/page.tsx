"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useIsAdmin } from "@/hooks/useCurrentUserRole";
import { useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "react-hot-toast";

type UserRole = "admin" | "editor" | "viewer";

export default function UsersPage() {
  const users = useQuery(api.users.queries.listOrganizationUsers);
  const isAdmin = useIsAdmin();
  const updateUserRole = useMutation(api.users.mutations.updateUserRole);

  const handleRoleChange = async (userId: Id<"users">, role: UserRole) => {
    try {
      await updateUserRole({ userId, role });
      toast.success("Rolle erfolgreich aktualisiert");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Fehler beim Aktualisieren der Rolle";
      toast.error(errorMessage);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "??";
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "editor":
        return "Editor";
      case "viewer":
        return "Viewer";
      default:
        return "Viewer";
    }
  };

  if (!isAdmin) {
    return (
      <div>
        <PageHeader title="Users" />
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">Access Denied</h3>
          <p className="text-muted-foreground mt-2">
            You need admin permissions to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Users" />

      <div className="space-y-6">
        <p className="text-muted-foreground">
          Manage user roles and permissions for your organization
        </p>

        {!users || users.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">No users found</h3>
            <p className="text-muted-foreground mt-2">
              No users in your organization yet.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.image} />
                          <AvatarFallback>
                            {getInitials(user.name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {user.name || "Unknown User"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email || "No email"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          handleRoleChange(user._id, value as UserRole)
                        }
                        disabled={!isAdmin}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { AccessDenied } from "@/components/Settings/AccessDenied";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { formatDateTime } from "@/lib/formatters/formatDateTime";
import { useIsAdmin } from "@/lib/hooks/useCurrentUserRole";
import { useQuery } from "convex/react";
import { ScrollText } from "lucide-react";

export default function LogsPage() {
  const logs = useQuery(api.logs.queries.getLogs);
  const isAdmin = useIsAdmin();

  if (!isAdmin) return <AccessDenied title="Logs" />;

  if (!logs?.length) {
    return (
      <div>
        <PageHeader title="Logs" />
        <div className="text-center py-12 border rounded-lg">
          <ScrollText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Keine Logs vorhanden</h3>
          <p className="text-muted-foreground mt-2">
            Sobald Aktionen durchgeführt werden, erscheinen sie hier.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Logs" />
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zeitpunkt</TableHead>
              <TableHead>Aktion</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDateTime(log._creationTime)}
                </TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {log.details || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

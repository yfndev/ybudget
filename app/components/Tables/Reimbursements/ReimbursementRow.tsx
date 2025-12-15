"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/formatters/formatDate";
import { Check, Download, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";

function getStatusBadge(isApproved: boolean, rejectionNote?: string) {
  if (rejectionNote)
    return { variant: "destructive" as const, label: "Abgelehnt" };
  if (isApproved) return { variant: "default" as const, label: "Genehmigt" };
  return { variant: "secondary" as const, label: "Ausstehend" };
}

function StatusDot({
  isApproved,
  rejectionNote,
}: {
  isApproved: boolean;
  rejectionNote?: string;
}) {
  const color = rejectionNote
    ? "bg-red-500"
    : isApproved
      ? "bg-green-500"
      : "bg-yellow-500";
  return (
    <div className="flex items-center justify-center">
      <div className={`w-2 h-2 rounded-full ${color}`} />
    </div>
  );
}

function ActionButtons({
  isAdmin,
  isApproved,
  hasRejection,
  onApprove,
  onReject,
  onDownload,
  onDelete,
}: {
  isAdmin: boolean;
  isApproved: boolean;
  hasRejection: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  const showAdminActions = isAdmin && !isApproved;
  return (
    <div className="flex items-center justify-end gap-0.5">
      {showAdminActions && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={onApprove}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onReject}
            disabled={hasRejection}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onDownload}
      >
        <Download className="h-4 w-4" />
      </Button>
      {showAdminActions && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

interface ReimbursementRowProps {
  item: {
    _id: string;
    _creationTime: number;
    isApproved: boolean;
    rejectionNote?: string;
    projectName: string;
    creatorName: string;
    amount: number;
  };
  isAdmin: boolean;
  description: ReactNode;
  onClick?: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export function ReimbursementRow({
  item,
  isAdmin,
  description,
  onClick,
  onApprove,
  onReject,
  onDownload,
  onDelete,
}: ReimbursementRowProps) {
  const status = getStatusBadge(item.isApproved, item.rejectionNote);
  return (
    <TableRow
      className={onClick ? "cursor-pointer" : undefined}
      onClick={onClick}
    >
      <TableCell className="px-1">
        <StatusDot
          isApproved={item.isApproved}
          rejectionNote={item.rejectionNote}
        />
      </TableCell>
      <TableCell>{formatDate(new Date(item._creationTime))}</TableCell>
      <TableCell>{item.projectName}</TableCell>
      <TableCell className="text-muted-foreground">
        {description}
        {item.rejectionNote && (
          <span className="block text-xs text-red-600">
            Ablehnung: {item.rejectionNote}
          </span>
        )}
      </TableCell>
      {isAdmin && <TableCell>{item.creatorName}</TableCell>}
      <TableCell className="text-right font-medium">
        {item.amount.toFixed(2)} €
      </TableCell>
      <TableCell>
        <Badge variant={status.variant}>{status.label}</Badge>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <ActionButtons
          isAdmin={isAdmin}
          isApproved={item.isApproved}
          hasRejection={!!item.rejectionNote}
          onApprove={onApprove}
          onReject={onReject}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
}

"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { Id } from "@/convex/_generated/dataModel";
import { formatDate } from "@/lib/formatters/formatDate";
import { Check, Download, Plus, Trash2, X } from "lucide-react";

type Reimbursement = {
  _id: Id<"reimbursements">;
  _creationTime: number;
  projectName: string;
  amount: number;
  isApproved: boolean;
  rejectionNote?: string;
  creatorName?: string;
  type: "expense" | "travel";
  travelDetails?: { destination?: string };
};

type Allowance = {
  _id: Id<"volunteerAllowance">;
  _creationTime: number;
  projectName: string;
  amount: number;
  isApproved: boolean;
  rejectionNote?: string;
  creatorName?: string;
  volunteerName: string;
  signatureStorageId?: Id<"_storage">;
};

type RejectDialog = {
  open: boolean;
  type: "reimbursement" | "allowance";
  id: Id<"reimbursements"> | Id<"volunteerAllowance"> | null;
  note: string;
};

interface ReimbursementPageUIProps {
  isAdmin: boolean;
  isLoading: boolean;
  reimbursements: Reimbursement[];
  allowances: Allowance[];
  rejectDialog: RejectDialog;
  onNewClick: () => void;
  onRowClick: (id: Id<"reimbursements">) => void;
  onApproveReimbursement: (id: Id<"reimbursements">) => void;
  onApproveAllowance: (id: Id<"volunteerAllowance">) => void;
  onOpenRejectDialog: (type: "reimbursement" | "allowance", id: Id<"reimbursements"> | Id<"volunteerAllowance">) => void;
  onRejectDialogChange: (dialog: RejectDialog) => void;
  onReject: () => void;
  onDownloadReimbursement: (id: Id<"reimbursements">) => void;
  onDownloadAllowance: (allowance: Allowance) => void;
  onDeleteReimbursement: (id: Id<"reimbursements">) => void;
  onDeleteAllowance: (id: Id<"volunteerAllowance">) => void;
}

function getStatusBadge(isApproved: boolean, rejectionNote?: string) {
  if (rejectionNote) return { variant: "destructive" as const, label: "Abgelehnt" };
  if (isApproved) return { variant: "default" as const, label: "Genehmigt" };
  return { variant: "secondary" as const, label: "Ausstehend" };
}

function getStatusColor(isApproved: boolean, rejectionNote?: string) {
  if (rejectionNote) return "bg-red-500";
  if (isApproved) return "bg-green-500";
  return "bg-yellow-500";
}

function StatusDot({ isApproved, rejectionNote }: { isApproved: boolean; rejectionNote?: string }) {
  return (
    <div className="flex items-center justify-center">
      <div className={`w-2 h-2 rounded-full ${getStatusColor(isApproved, rejectionNote)}`} />
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
  return (
    <div className="flex items-center justify-end gap-0.5">
      {isAdmin && !isApproved && (
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
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDownload}>
        <Download className="h-4 w-4" />
      </Button>
      {isAdmin && !isApproved && (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default function ReimbursementPageUI({
  isAdmin,
  isLoading,
  reimbursements,
  allowances,
  rejectDialog,
  onNewClick,
  onRowClick,
  onApproveReimbursement,
  onApproveAllowance,
  onOpenRejectDialog,
  onRejectDialogChange,
  onReject,
  onDownloadReimbursement,
  onDownloadAllowance,
  onDeleteReimbursement,
  onDeleteAllowance,
}: ReimbursementPageUIProps) {
  const isEmpty = reimbursements.length === 0 && allowances.length === 0;

  return (
    <div className="flex flex-col w-full h-screen">
      <PageHeader title="Erstattungen" />

      <div className="flex justify-end mb-4">
        <Button variant="secondary" onClick={onNewClick}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Erstattung
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Keine Erstattungen gefunden.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]" />
                <TableHead>Datum</TableHead>
                <TableHead>Projekt</TableHead>
                <TableHead>Beschreibung</TableHead>
                {isAdmin && <TableHead>Ersteller</TableHead>}
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {reimbursements.map((item) => {
                const status = getStatusBadge(item.isApproved, item.rejectionNote);
                return (
                  <TableRow
                    key={item._id}
                    className="cursor-pointer"
                    onClick={() => onRowClick(item._id)}
                  >
                    <TableCell className="px-1">
                      <StatusDot isApproved={item.isApproved} rejectionNote={item.rejectionNote} />
                    </TableCell>
                    <TableCell>{formatDate(new Date(item._creationTime))}</TableCell>
                    <TableCell>{item.projectName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.type === "travel" ? (
                        <div>
                          <span>Reisekostenerstattung</span>
                          {item.travelDetails?.destination && (
                            <span className="block text-xs">{item.travelDetails.destination}</span>
                          )}
                        </div>
                      ) : (
                        "Auslagenerstattung"
                      )}
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
                        onApprove={() => onApproveReimbursement(item._id)}
                        onReject={() => onOpenRejectDialog("reimbursement", item._id)}
                        onDownload={() => onDownloadReimbursement(item._id)}
                        onDelete={() => onDeleteReimbursement(item._id)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}

              {allowances.map((item) => {
                const status = getStatusBadge(item.isApproved, item.rejectionNote);
                return (
                  <TableRow key={item._id}>
                    <TableCell className="px-1">
                      <StatusDot isApproved={item.isApproved} rejectionNote={item.rejectionNote} />
                    </TableCell>
                    <TableCell>{formatDate(new Date(item._creationTime))}</TableCell>
                    <TableCell>{item.projectName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <div>
                        <span>Ehrenamtspauschale</span>
                        <span className="block text-xs">{item.volunteerName}</span>
                      </div>
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
                        onApprove={() => onApproveAllowance(item._id)}
                        onReject={() => onOpenRejectDialog("allowance", item._id)}
                        onDownload={() => onDownloadAllowance(item)}
                        onDelete={() => onDeleteAllowance(item._id)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => onRejectDialogChange({ ...rejectDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ablehnen</DialogTitle>
            <DialogDescription>Bitte gib einen Grund für die Ablehnung ein.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectDialog.note}
            onChange={(e) => onRejectDialogChange({ ...rejectDialog, note: e.target.value })}
            placeholder="Grund für die Ablehnung..."
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onRejectDialogChange({ ...rejectDialog, open: false })}
            >
              Abbrechen
            </Button>
            <Button onClick={onReject} disabled={!rejectDialog.note}>
              Ablehnen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

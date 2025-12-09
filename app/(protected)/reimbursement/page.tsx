"use client";

import { RejectReimbursementDialog } from "@/components/Dialogs/RejectReimbursementDialog";
import { PageHeader } from "@/components/Layout/PageHeader";
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
import { formatDate } from "@/lib/formatters/formatDate";
import { generateReimbursementPDF } from "@/lib/files/generateReimbursementPDF";
import { useIsAdmin } from "@/lib/hooks/useCurrentUserRole";
import { useConvex, useMutation, useQuery } from "convex/react";
import { Check, Download, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-500",
  rejected: "bg-red-500",
};

const STATUS_BADGES: Record<
  string,
  {
    variant: "default" | "destructive" | "secondary" | "outline";
    label: string;
  }
> = {
  paid: { variant: "default", label: "Bezahlt" },
  approved: { variant: "default", label: "Genehmigt" },
  rejected: { variant: "destructive", label: "Abgelehnt" },
  pending: { variant: "secondary", label: "Ausstehend" },
};

export default function ReimbursementPage() {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const convex = useConvex();
  const reimbursements = useQuery(
    api.reimbursements.queries.getAllReimbursements,
  );
  const markAsPaid = useMutation(api.reimbursements.functions.markAsPaid);
  const rejectReimbursement = useMutation(
    api.reimbursements.functions.rejectReimbursement,
  );
  const deleteReimbursement = useMutation(
    api.reimbursements.functions.deleteReimbursement,
  );

  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    reimbursementId: Id<"reimbursements"> | null;
    note: string;
  }>({ open: false, reimbursementId: null, note: "" });

  const handleReject = async () => {
    if (!rejectDialog.reimbursementId || !rejectDialog.note) return;
    await rejectReimbursement({
      reimbursementId: rejectDialog.reimbursementId,
      adminNote: rejectDialog.note,
    });
    setRejectDialog({ open: false, reimbursementId: null, note: "" });
  };

  const handleDownloadPDF = async (reimbursementId: Id<"reimbursements">) => {
    const reimbursement = await convex.query(
      api.reimbursements.queries.getReimbursement,
      { reimbursementId },
    );
    if (!reimbursement) return;

    const receipts = await convex.query(
      api.reimbursements.queries.getReceipts,
      {
        reimbursementId,
      },
    );

    const receiptsWithUrls = await Promise.all(
      receipts.map(async (receipt) => ({
        ...receipt,
        fileUrl: await convex.query(api.reimbursements.queries.getFileUrl, {
          storageId: receipt.fileStorageId,
        }),
      })),
    );

    const pdfBlob = await generateReimbursementPDF(
      reimbursement,
      receiptsWithUrls,
    );
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Auslagenerstattung_${reimbursementId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <PageHeader title="Erstattungen" />

      <div className="flex justify-end mb-4">
        <Button
          variant="secondary"
          onClick={() => router.push("/reimbursement/new")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Neue Erstattung
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        {!reimbursements ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : reimbursements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Keine Erstattungen gefunden.
            </p>
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
              {reimbursements.map((reimbursement) => (
                <TableRow
                  key={reimbursement._id}
                  className="cursor-pointer px-2"
                  onClick={() =>
                    router.push(`/reimbursement/${reimbursement._id}`)
                  }
                >
                  <TableCell className="px-1">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-2 h-2 rounded-full ${STATUS_COLORS[reimbursement.status] || "bg-yellow-500"}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="pl-2">
                    {formatDate(new Date(reimbursement._creationTime))}
                  </TableCell>
                  <TableCell>{reimbursement.projectName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {reimbursement.type === "travel" ? (
                      <div>
                        <span>Reisekostenerstattung</span>
                        {reimbursement.travelDetails?.destination && (
                          <span className="block text-xs">
                            {reimbursement.travelDetails.destination}
                          </span>
                        )}
                      </div>
                    ) : (
                      "Auslagenerstattung"
                    )}
                    {reimbursement.adminNote &&
                      reimbursement.status === "rejected" && (
                        <span className="block text-xs text-red-600">
                          Ablehnung: {reimbursement.adminNote}
                        </span>
                      )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>{reimbursement.creatorName}</TableCell>
                  )}
                  <TableCell className="text-right font-medium">
                    {reimbursement.amount.toFixed(2)} €
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        STATUS_BADGES[reimbursement.status]?.variant ||
                        "outline"
                      }
                    >
                      {STATUS_BADGES[reimbursement.status]?.label || "Entwurf"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    onClick={(e) => e.stopPropagation()}
                    className="w-fit"
                  >
                    <div className="flex items-center justify-end gap-0.5">
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() =>
                              markAsPaid({ reimbursementId: reimbursement._id })
                            }
                            disabled={reimbursement.status === "paid"}
                            title="Als bezahlt markieren"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              setRejectDialog({
                                open: true,
                                reimbursementId: reimbursement._id,
                                note: "",
                              })
                            }
                            disabled={reimbursement.status === "rejected"}
                            title="Ablehnen"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDownloadPDF(reimbursement._id)}
                        title="PDF herunterladen"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            deleteReimbursement({
                              reimbursementId: reimbursement._id,
                            })
                          }
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <RejectReimbursementDialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}
        note={rejectDialog.note}
        onNoteChange={(note) => setRejectDialog({ ...rejectDialog, note })}
        onReject={handleReject}
      />
    </div>
  );
}

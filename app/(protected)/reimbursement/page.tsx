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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useIsAdmin } from "@/hooks/useCurrentUserRole";
import { formatDate } from "@/lib/formatDate";
import { useMutation, useQuery, useConvex } from "convex/react";
import { ArrowUpDown, Download, MoreHorizontal, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { generateReimbursementPDF } from "@/lib/generateReimbursementPDF";

export default function ReimbursementPage() {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const convex = useConvex();
  const currentUser = useQuery(api.users.queries.getCurrentUserProfile);
  const reimbursements = useQuery(
    api.reimbursements.queries.getAllReimbursements
  );
  const markAsPaid = useMutation(api.reimbursements.functions.markAsPaid);
  const rejectReimbursement = useMutation(
    api.reimbursements.functions.rejectReimbursement
  );
  const deleteReimbursement = useMutation(
    api.reimbursements.functions.deleteReimbursementAdmin
  );

  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    reimbursementId: Id<"reimbursements"> | null;
    note: string;
  }>({
    open: false,
    reimbursementId: null,
    note: "",
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      draft: { variant: "outline", label: "Entwurf" },
      pending: { variant: "secondary", label: "Ausstehend" },
      approved: { variant: "default", label: "Genehmigt" },
      rejected: { variant: "destructive", label: "Abgelehnt" },
      paid: { variant: "default", label: "Bezahlt" },
    };
    const config = variants[status] || {
      variant: "outline" as const,
      label: status,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleReject = async () => {
    if (rejectDialog.reimbursementId && rejectDialog.note) {
      await rejectReimbursement({
        reimbursementId: rejectDialog.reimbursementId,
        adminNote: rejectDialog.note,
      });
      setRejectDialog({ open: false, reimbursementId: null, note: "" });
    }
  };

  const handleDownloadPDF = async (reimbursementId: Id<"reimbursements">) => {
    try {
      const reimbursement = await convex.query(api.reimbursements.queries.getReimbursement, { reimbursementId });
      if (!reimbursement) return;

      const receipts = await convex.query(api.reimbursements.queries.getReceipts, { reimbursementId });

      const receiptsWithUrls = await Promise.all(
        receipts.map(async receipt => ({
          ...receipt,
          fileUrl: await convex.query(api.reimbursements.queries.getFileUrl, {
            storageId: receipt.fileStorageId
          })
        }))
      );

      const pdfBlob = await generateReimbursementPDF(reimbursement, receiptsWithUrls);

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Auslagenerstattung_${reimbursementId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <PageHeader title="Auslagenerstattung" />

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
                <TableHead className="w-[30px]"></TableHead>
                <TableHead>
                  <Button variant="ghost" className="h-8 px-2">
                    Datum
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Projekt</TableHead>
                <TableHead>Beschreibung</TableHead>
                {isAdmin && <TableHead>Ersteller</TableHead>}
                <TableHead className="text-right">
                  <Button variant="ghost" className="h-8 px-2">
                    Betrag
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reimbursements.map((reimbursement) => (
                <TableRow
                  key={reimbursement._id}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/reimbursement/${reimbursement._id}`)
                  }
                >
                  <TableCell className="px-1">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          reimbursement.status === "paid"
                            ? "bg-green-500"
                            : reimbursement.status === "rejected"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                        }`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="pl-2">
                    {formatDate(new Date(reimbursement._creationTime))}
                  </TableCell>
                  <TableCell>{reimbursement.projectName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    Auslagenerstattung
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
                  <TableCell>{getStatusBadge(reimbursement.status)}</TableCell>
                  {isAdmin || reimbursement.createdBy === currentUser?._id ? (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/reimbursement/${reimbursement._id}`)
                            }
                          >
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownloadPDF(reimbursement._id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            PDF herunterladen
                          </DropdownMenuItem>
                          {isAdmin && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  markAsPaid({
                                    reimbursementId: reimbursement._id,
                                  })
                                }
                                disabled={reimbursement.status === "paid"}
                              >
                                Als bezahlt markieren
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setRejectDialog({
                                    open: true,
                                    reimbursementId: reimbursement._id,
                                    note: "",
                                  })
                                }
                                disabled={reimbursement.status === "rejected"}
                              >
                                Ablehnen
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  deleteReimbursement({
                                    reimbursementId: reimbursement._id,
                                  })
                                }
                              >
                                Löschen
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  ) : (
                    <TableCell />
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erstattung ablehnen</DialogTitle>
            <DialogDescription>
              Bitte geben Sie einen Grund für die Ablehnung ein. Diese Nachricht
              wird dem Nutzer angezeigt.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectDialog.note}
            onChange={(e) =>
              setRejectDialog({ ...rejectDialog, note: e.target.value })
            }
            placeholder="Grund für die Ablehnung..."
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRejectDialog({
                  open: false,
                  reimbursementId: null,
                  note: "",
                })
              }
            >
              Abbrechen
            </Button>
            <Button onClick={handleReject} disabled={!rejectDialog.note}>
              Ablehnen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

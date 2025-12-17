"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

interface Props<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onUpdate?: (rowId: string, field: string, value: any) => Promise<void>;
  onDelete?: (rowId: string) => Promise<void>;
  paginationStatus?:
    | "Loading"
    | "LoadingMore"
    | "CanLoadMore"
    | "Exhausted"
    | "LoadingFirstPage";
  loadMore?: () => void;
}

export function EditableDataTable<T extends { _id: string }>({
  columns,
  data,
  onUpdate,
  onDelete,
  paginationStatus,
  loadMore,
}: Props<T>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLTableRowElement>(null);

  const hasNextPage = paginationStatus === "CanLoadMore";
  const isLoading =
    paginationStatus === "LoadingMore" ||
    paginationStatus === "LoadingFirstPage";

  const startEditing = (rowId: string) => {
    setEditingRows((prev) => new Set(prev).add(rowId));
  };

  const stopEditing = (rowId: string) => {
    setEditingRows((prev) => {
      const updated = new Set(prev);
      updated.delete(rowId);
      return updated;
    });
  };

  const handleUpdate = async (rowId: string, field: string, value: any) => {
    if (!onUpdate) return;
    setIsUpdating(true);
    try {
      await onUpdate(rowId, field, value);
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = (rowId: string) => {
    stopEditing(rowId);
    toast.success("Gespeichert");
  };

  const handleDelete = async () => {
    if (!onDelete || !deleteRowId) return;
    setIsUpdating(true);
    try {
      await onDelete(deleteRowId);
      stopEditing(deleteRowId);
      toast.success("Transaktion gelöscht");
    } catch {
      toast.error("Fehler beim Löschen");
    } finally {
      setIsUpdating(false);
      setDeleteRowId(null);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    meta: {
      editingRows,
      setEditingRows,
      onUpdate: handleUpdate,
      onSave: handleSave,
      onStopEditing: stopEditing,
      onDelete: setDeleteRowId,
      isUpdating,
    },
  });

  useEffect(() => {
    if (!scrollRef.current || !hasNextPage || isLoading || !loadMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    });
    observer.observe(scrollRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isLoading, loadMore]);

  const rows = table.getRowModel().rows;

  return (
    <>
      <div className="rounded-md border overflow-visible w-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <TableContent
              rows={rows}
              columns={columns}
              isLoading={isLoading}
              hasNextPage={hasNextPage}
              scrollRef={scrollRef}
              editingRows={editingRows}
              onStartEditing={startEditing}
            />
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!deleteRowId}
        onOpenChange={(open) => !open && setDeleteRowId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transaktion löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function TableContent({
  rows,
  columns,
  isLoading,
  hasNextPage,
  scrollRef,
  editingRows,
  onStartEditing,
}: {
  rows: any[];
  columns: any[];
  isLoading: boolean;
  hasNextPage: boolean;
  scrollRef: React.RefObject<HTMLTableRowElement | null>;
  editingRows: Set<string>;
  onStartEditing: (rowId: string) => void;
}) {
  if (rows.length > 0) {
    return (
      <>
        {rows.map((row) => {
          const rowId = row.original._id;
          const isEditing = editingRows.has(rowId);

          return (
            <TableRow
              key={row.id}
              onDoubleClick={() => !isEditing && onStartEditing(rowId)}
              className={isEditing ? "" : "cursor-pointer"}
            >
              {row.getVisibleCells().map((cell: any) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
        {hasNextPage && (
          <TableRow ref={scrollRef}>
            <TableCell colSpan={columns.length} className="h-16 text-center">
              {isLoading ? "Lade mehr..." : ""}
            </TableCell>
          </TableRow>
        )}
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        {[1, 2, 3, 4, 5].map((rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-24 text-center">
        Keine Ergebnisse
      </TableCell>
    </TableRow>
  );
}

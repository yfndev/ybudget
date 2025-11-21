"use client";

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

interface EditableDataTableProps<T> {
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
}: EditableDataTableProps<T>) {
  const hasNextPage = paginationStatus === "CanLoadMore";
  const isLoading =
    paginationStatus === "LoadingMore" ||
    paginationStatus === "LoadingFirstPage";
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, Record<string, any>>
  >({});
  const [isUpdating, setIsUpdating] = useState(false);
  const scrollRef = useRef<HTMLTableRowElement>(null);

  const updatePendingChanges = (rowId: string, field: string, value: any) => {
    setPendingChanges((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [field]: value,
      },
    }));
  };

  const saveRow = async (rowId: string) => {
    const changes = pendingChanges[rowId];
    if (!changes || Object.keys(changes).length === 0) return;
    if (!onUpdate) return;

    setIsUpdating(true);
    try {
      for (const [field, value] of Object.entries(changes)) {
        await onUpdate(rowId, field, value);
      }
      setPendingChanges((prev) => {
        const updated = { ...prev };
        delete updated[rowId];
        return updated;
      });
      setEditingRows((prev) => {
        const updated = new Set(prev);
        updated.delete(rowId);
        return updated;
      });
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelRow = (rowId: string) => {
    setPendingChanges((prev) => {
      const updated = { ...prev };
      delete updated[rowId];
      return updated;
    });
    setEditingRows((prev) => {
      const updated = new Set(prev);
      updated.delete(rowId);
      return updated;
    });
  };

  const deleteRow = async (rowId: string) => {
    if (!onDelete) return;

    setIsUpdating(true);
    try {
      await onDelete(rowId);

      setPendingChanges((prev) => {
        const updated = { ...prev };
        delete updated[rowId];
        return updated;
      });
      setEditingRows((prev) => {
        const updated = new Set(prev);
        updated.delete(rowId);
        return updated;
      });
      toast.success("Transaktion erfolgreich gelöscht");
    } catch (error) {
      toast.error("Fehler beim Löschen der Transaktion");
    } finally {
      setIsUpdating(false);
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
      editingCell,
      setEditingCell,
      pendingChanges,
      setPendingChanges,
      onUpdate: updatePendingChanges,
      onSaveRow: saveRow,
      onCancelRow: cancelRow,
      onDelete: deleteRow,
      isUpdating,
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isLoading && loadMore) {
        loadMore();
      }
    });

    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isLoading, loadMore]);

  useEffect(() => {
    const hasUnsavedChanges = Object.keys(pendingChanges).length > 0;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pendingChanges]);

  const rows = table.getRowModel().rows;

  return (
    <div className="rounded-md border overflow-x-auto w-full">
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
          {rows.length > 0 ? (
            <>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {hasNextPage && (
                <TableRow ref={scrollRef}>
                  <TableCell
                    colSpan={columns.length}
                    className="h-16 text-center"
                  >
                    {isLoading ? "Lade mehr..." : ""}
                  </TableCell>
                </TableRow>
              )}
            </>
          ) : isLoading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Keine Ergebnisse
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

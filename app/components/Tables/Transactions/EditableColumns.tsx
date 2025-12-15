"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { formatDate } from "@/lib/formatters/formatDate";
import { ArrowUpDown, Check, Pencil, Trash2, X } from "lucide-react";
import {
  EditableAmountCell,
  EditableCategoryCell,
  EditableDateCell,
  EditableProjectCell,
  EditableTextareaCell,
} from "./EditableCells";

function SortableHeader({ column, label }: { column: any; label: string }) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting()}
      className="h-8 px-2"
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

function ActionsCell({ row, table }: { row: any; table: any }) {
  const rowId = row.original._id;
  const isPlanned = row.original.status === "expected";
  const isEditing = table.options.meta?.editingRows?.has(rowId);

  if (isEditing) {
    return (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.options.meta?.onSave(rowId)}
          className="h-8 w-8 p-0 text-green-500 hover:text-green-600"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.options.meta?.onStopEditing(rowId)}
          className="h-8 w-8 p-0 text-red-400 hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </Button>
        {isPlanned && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.options.meta?.onDelete(rowId)}
            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          table.options.meta?.setEditingRows((prev: Set<string>) =>
            new Set(prev).add(rowId),
          )
        }
        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
}

function getEditState(row: any, table: any) {
  const rowId = row.original._id;
  const isPlanned = row.original.status === "expected";
  const isEditing = table.options.meta?.editingRows?.has(rowId);
  const onUpdate = (field: string, value: any) =>
    table.options.meta?.onUpdate(rowId, field, value);
  return { rowId, isPlanned, isEditing, onUpdate };
}

const baseColumns = [
  {
    id: "indicator",
    cell: ({ row }: any) => (
      <div className="flex items-center px-1 justify-center">
        <div
          className={`w-2 h-2 rounded-full ${row.getValue("amount") < 0 ? "bg-red-500" : "bg-green-500"}`}
        />
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }: any) => (
      <SortableHeader column={column} label="Datum" />
    ),
    cell: ({ row, table }: any) => {
      const { isPlanned, isEditing, onUpdate } = getEditState(row, table);
      if (isPlanned && isEditing) {
        return (
          <div className="pl-2">
            <EditableDateCell
              value={row.getValue("date")}
              onSave={(v) => onUpdate("date", v)}
            />
          </div>
        );
      }
      return <div className="pl-2">{formatDate(row.getValue("date"))}</div>;
    },
  },
  {
    accessorKey: "projectName",
    header: "Projekt",
    cell: ({ row, table }: any) => {
      const { isPlanned, isEditing, onUpdate } = getEditState(row, table);
      if (isPlanned && isEditing) {
        return (
          <EditableProjectCell
            value={row.original.projectId}
            onSave={(v) => onUpdate("projectId", v)}
          />
        );
      }
      return (
        <div className="p-1 max-w-32">{row.original.projectName || ""}</div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Beschreibung",
    cell: ({ row, table }: any) => {
      const { isEditing, onUpdate } = getEditState(row, table);
      const description =
        row.getValue("description") || row.original.reference || "";
      if (isEditing) {
        return (
          <EditableTextareaCell
            value={description}
            onSave={(v) => onUpdate("description", v)}
          />
        );
      }
      return (
        <div className="min-w-64 max-w-xl">
          <div className="whitespace-pre-wrap text-muted-foreground wrap-break-word text-sm">
            {description}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "categoryName",
    header: "Kategorie",
    cell: ({ row, table }: any) => {
      const { isEditing, onUpdate } = getEditState(row, table);
      if (isEditing) {
        return (
          <EditableCategoryCell
            value={row.original.categoryId}
            onSave={(v) => onUpdate("categoryId", v)}
          />
        );
      }
      return (
        <div className="p-1 max-w-32">{row.original.categoryName || ""}</div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }: any) => (
      <div className="flex justify-end">
        <SortableHeader column={column} label="Betrag" />
      </div>
    ),
    cell: ({ row, table }: any) => {
      const { isPlanned, isEditing, onUpdate } = getEditState(row, table);
      const amount = row.getValue("amount");
      if (isPlanned && isEditing) {
        return (
          <div className="flex justify-end pr-2">
            <EditableAmountCell
              value={amount}
              onSave={(v) => onUpdate("amount", v)}
            />
          </div>
        );
      }
      return (
        <div className="text-right font-medium pr-2">
          {formatCurrency(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status");
      const isBudgetSplit = !!row.original.splitFromTransactionId;
      const label = isBudgetSplit
        ? "Budget"
        : status === "expected"
          ? "Geplant"
          : "Abgerechnet";
      const variant = isBudgetSplit
        ? "outline"
        : status === "processed"
          ? "default"
          : "secondary";
      return <Badge variant={variant}>{label}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ActionsCell,
  },
];

export const editableColumns = baseColumns;

export const editableColumnsWithoutProject = baseColumns.filter(
  (col) => col.accessorKey !== "projectName",
);

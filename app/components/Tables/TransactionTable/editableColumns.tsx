"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { ArrowUpDown, Check, MoreHorizontal, X } from "lucide-react";
import {
  EditableAmountCell,
  EditableCategoryCell,
  EditableDateCell,
  EditableProjectCell,
  EditableSelectCell,
  EditableTextareaCell,
} from "./EditableCells";

const getEditingState = (row: any, table: any) => {
  const rowId = row.original._id;
  const status = row.original.status;
  const isPlanned = status === "expected";
  const isRowEditing = table.options.meta?.editingRows?.has(rowId) || false;
  return { rowId, status, isPlanned, isRowEditing };
};

const createEditableCellHandlers = (rowId: string, table: any) => ({
  handleSave: (field: string) => (value: any) =>
    table.options.meta?.onUpdate(rowId, field, value),
  handleCancel: () => table.options.meta?.onCancelRow(rowId),
  handleEdit: () => {},
  handleDelete: () => table.options.meta?.onDelete(rowId),
});

const renderEditableCell = (
  CellComponent: any,
  handlers: any,
  value: any,
  displayValue: any,
  fieldId: string,
) => (
  <CellComponent
    value={value}
    displayValue={displayValue}
    onSave={handlers.handleSave(fieldId)}
    onCancel={handlers.handleCancel}
    isEditing={true}
    onEdit={handlers.handleEdit}
    onDelete={handlers.handleDelete}
  />
);

export const editableColumns = [
  {
    id: "indicator",
    cell: ({ row }: any) => {
      const amount = row.getValue("amount");
      const dotColor = amount < 0 ? "bg-red-500" : "bg-green-500";
      return (
        <div className="flex items-center px-1 justify-center">
          <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }: any) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting()}
        className="h-8 px-2"
      >
        Datum
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row, table }: any) => {
      const { isPlanned, isRowEditing } = getEditingState(row, table);
      const handlers = createEditableCellHandlers(row.original._id, table);

      if (isPlanned && isRowEditing) {
        return (
          <div className="pl-2">
            {renderEditableCell(
              EditableDateCell,
              handlers,
              row.getValue("date"),
              undefined,
              "date",
            )}
          </div>
        );
      }

      return <div className="pl-2">{formatDate(row.getValue("date"))}</div>;
    },
  },
  {
    accessorKey: "projectName",
    header: () => null,
    cell: ({ row, table }: any) => {
      const { isPlanned, isRowEditing } = getEditingState(row, table);
      const handlers = createEditableCellHandlers(row.original._id, table);

      if (isPlanned && isRowEditing) {
        return renderEditableCell(
          EditableProjectCell,
          handlers,
          row.original.projectId,
          row.original.projectName,
          "projectId",
        );
      }

      return null;
    },
  },
  {
    accessorKey: "description",
    header: "Beschreibung",
    cell: ({ row, table }: any) => {
      const { isRowEditing } = getEditingState(row, table);
      const handlers = createEditableCellHandlers(row.original._id, table);
      const description =
        row.getValue("description") || row.original.reference || "";

      if (isRowEditing) {
        return renderEditableCell(
          EditableTextareaCell,
          handlers,
          description,
          undefined,
          "description",
        );
      }

      return (
        <div className="min-w-64 max-w-xl">
          <div className="whitespace-pre-wrap text-muted-foreground break-words text-sm">
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
      const { isRowEditing } = getEditingState(row, table);
      const handlers = createEditableCellHandlers(row.original._id, table);

      if (isRowEditing) {
        return renderEditableCell(
          EditableCategoryCell,
          handlers,
          row.original.categoryId,
          row.original.categoryName,
          "categoryId",
        );
      }

      return (
        <div className="p-1 max-w-32 ">{row.original.categoryName || ""}</div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }: any) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting()}
        className="h-8 px-2 w-full justify-end"
      >
        Betrag
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row, table }: any) => {
      const { isPlanned, isRowEditing } = getEditingState(row, table);
      const handlers = createEditableCellHandlers(row.original._id, table);
      const amount = row.getValue("amount");

      if (isPlanned && isRowEditing) {
        return (
          <div className="flex justify-end pr-2">
            {renderEditableCell(
              EditableAmountCell,
              handlers,
              amount,
              undefined,
              "amount",
            )}
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
    cell: ({ row, table }: any) => {
      const { isPlanned, isRowEditing } = getEditingState(row, table);
      const handlers = createEditableCellHandlers(row.original._id, table);
      const status = row.getValue("status");

      if (isPlanned && isRowEditing) {
        return (
          <EditableSelectCell
            value={status}
            onSave={handlers.handleSave("status")}
            onCancel={handlers.handleCancel}
            isEditing={true}
            onEdit={handlers.handleEdit}
            options={[
              { value: "expected", label: "Geplant" },
              { value: "processed", label: "Abgerechnet" },
            ]}
          />
        );
      }

      const variant =
        status === "processed" ? "default" : ("secondary" as const);
      const displayText = status === "processed" ? "Abgerechnet" : "Geplant";

      return <Badge variant={variant}>{displayText}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row, table }: any) => {
      const { rowId, isPlanned, isRowEditing } = getEditingState(row, table);
      const isUpdating = table.options.meta?.isUpdating || false;

      const handleEdit = () => {
        if (!isRowEditing) {
          table.options.meta?.setEditingRows((prev: Set<string>) => {
            const updated = new Set(prev);
            updated.add(rowId);
            return updated;
          });
        }
      };

      const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        await table.options.meta?.onDelete(rowId);
      };

      if (isRowEditing) {
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.options.meta?.onSaveRow(rowId)}
              disabled={isUpdating}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.options.meta?.onCancelRow(rowId)}
              disabled={isUpdating}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        );
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>Bearbeiten</DropdownMenuItem>
            {isPlanned && (
              <DropdownMenuItem
                onClick={handleDelete}
                onSelect={(e) => e.preventDefault()}
              >
                Löschen
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

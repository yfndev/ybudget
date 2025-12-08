"use client";

import { DateInput } from "@/components/Selectors/DateInput";
import { SelectCategory } from "@/components/Selectors/SelectCategory";
import { SelectProject } from "@/components/Selectors/SelectProject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatCurrency";
import { format } from "date-fns";
import { Check, X } from "lucide-react";
import { useState } from "react";

interface EditableCellProps {
  value: any;
  onSave: (value: any) => void;
  onCancel: () => void;
  isEditing: boolean;
  onEdit: () => void;
  pendingValue?: any;
  displayValue?: string;
}

function EditableWrapper({
  isEditing,
  onEdit,
  children,
  editContent,
}: {
  isEditing: boolean;
  onEdit: () => void;
  children: React.ReactNode;
  editContent: React.ReactNode;
}) {
  if (isEditing) return <>{editContent}</>;
  return (
    <div className="cursor-pointer hover:bg-muted p-1 rounded" onDoubleClick={onEdit}>
      {children}
    </div>
  );
}

export function EditableTextCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
}: EditableCellProps) {
  const [editValue, setEditValue] = useState(value || "");

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(editValue.trim());
    } else {
      setEditValue(value || "");
      onCancel();
    }
  };

  const handleCancel = () => {
    setEditValue(value || "");
    onCancel();
  };

  return (
    <EditableWrapper isEditing={isEditing} onEdit={onEdit} editContent={
      <div className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <Button size="sm" variant="ghost" onClick={handleSave}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    }>
      {value || ""}
    </EditableWrapper>
  );
}

export function EditableAmountCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
  pendingValue,
}: EditableCellProps) {
  const currentValue = pendingValue ?? value;
  const [editValue, setEditValue] = useState(Math.abs(currentValue || 0).toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    const numValue = parseFloat(e.target.value);
    if (!isNaN(numValue)) {
      onSave(value < 0 ? -Math.abs(numValue) : Math.abs(numValue));
    }
  };

  const handleCancel = () => {
    setEditValue(Math.abs(value || 0).toString());
    onCancel();
  };

  return (
    <EditableWrapper isEditing={isEditing} onEdit={onEdit} editContent={
      <Input
        type="number"
        value={editValue}
        onChange={handleChange}
        className="h-8 w-24 text-right"
        autoFocus
        step="0.01"
        onKeyDown={(e) => e.key === "Escape" && handleCancel()}
      />
    }>
      <div className="text-right font-medium">{formatCurrency(currentValue)}</div>
    </EditableWrapper>
  );
}

export function EditableDateCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
}: EditableCellProps) {
  const dateValue = value ? new Date(value) : null;
  const [editValue, setEditValue] = useState(
    dateValue ? format(dateValue, "yyyy-MM-dd") : ""
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    if (e.target.value) {
      const newDate = new Date(e.target.value);
      if (!isNaN(newDate.getTime())) {
        onSave(newDate.getTime());
      }
    }
  };

  const handleCancel = () => {
    setEditValue(dateValue ? format(dateValue, "yyyy-MM-dd") : "");
    onCancel();
  };

  return (
    <EditableWrapper isEditing={isEditing} onEdit={onEdit} editContent={
      <Input
        type="date"
        value={editValue}
        onChange={handleChange}
        className="h-8 w-36"
        autoFocus
        onKeyDown={(e) => e.key === "Escape" && handleCancel()}
      />
    }>
      {dateValue ? format(dateValue, "dd.MM.yyyy") : ""}
    </EditableWrapper>
  );
}

export function EditableTextareaCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
  pendingValue,
}: EditableCellProps) {
  const currentValue = pendingValue ?? value ?? "";

  return (
    <EditableWrapper isEditing={isEditing} onEdit={onEdit} editContent={
      <Textarea
        defaultValue={currentValue}
        onChange={(e) => onSave(e.target.value)}
        className="min-h-20 resize-none w-full"
        autoFocus
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
      />
    }>
      <div className="max-w-64 min-w-32">
        <div className="whitespace-pre-wrap text-muted-foreground wrap-break-word text-sm">
          {currentValue}
        </div>
      </div>
    </EditableWrapper>
  );
}

interface EditableSelectCellProps extends EditableCellProps {
  options: { value: string; label: string }[];
}

export function EditableSelectCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
  options,
}: EditableSelectCellProps) {
  return (
    <EditableWrapper isEditing={isEditing} onEdit={onEdit} editContent={
      <Select value={value} onValueChange={onSave}>
        <SelectTrigger className="h-8 w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    }>
      {options.find((opt) => opt.value === value)?.label || value || ""}
    </EditableWrapper>
  );
}

export function EditableProjectCell({
  value,
  onSave,
  isEditing,
  onEdit,
  displayValue,
  pendingValue,
}: EditableCellProps) {
  return (
    <EditableWrapper isEditing={isEditing} onEdit={onEdit} editContent={
      <div className="w-48">
        <SelectProject value={value} onValueChange={onSave} />
      </div>
    }>
      {displayValue || pendingValue || value || ""}
    </EditableWrapper>
  );
}

export function EditableCategoryCell({
  value,
  onSave,
  isEditing,
  onEdit,
  displayValue,
  pendingValue,
}: EditableCellProps) {
  return (
    <EditableWrapper isEditing={isEditing} onEdit={onEdit} editContent={
      <div className="w-64">
        <SelectCategory value={value} onValueChange={onSave} />
      </div>
    }>
      {displayValue || pendingValue || ""}
    </EditableWrapper>
  );
}

export function EditableDateCellWithCalendar({
  value,
  onSave,
  isEditing,
  onEdit,
  pendingValue,
}: EditableCellProps) {
  const dateValue = value ? new Date(value) : null;
  const pendingDate = pendingValue ? new Date(pendingValue) : null;
  const displayDate = pendingDate || dateValue;
  const isoValue = displayDate ? format(displayDate, "yyyy-MM-dd") : "";

  const handleChange = (isoDate: string) => {
    if (isoDate) {
      const newDate = new Date(isoDate);
      if (!isNaN(newDate.getTime())) {
        onSave(newDate.getTime());
      }
    }
  };

  return (
    <EditableWrapper isEditing={isEditing} onEdit={onEdit} editContent={
      <DateInput value={isoValue} onChange={handleChange} className="h-8 w-36" />
    }>
      {displayDate ? format(displayDate, "dd.MM.yyyy") : ""}
    </EditableWrapper>
  );
}

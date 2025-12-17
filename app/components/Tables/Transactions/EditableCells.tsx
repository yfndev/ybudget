"use client";

import { SelectCategory } from "@/components/Selectors/SelectCategory";
import { SelectProject } from "@/components/Selectors/SelectProject";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useState } from "react";

interface EditableNumberCellProps {
  value: number;
  onSave: (value: number) => void;
}

interface EditableStringCellProps {
  value: string;
  onSave: (value: string) => void;
}

export function EditableAmountCell({ value, onSave }: EditableNumberCellProps) {
  const [editValue, setEditValue] = useState(Math.abs(value || 0).toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    const numValue = parseFloat(e.target.value);
    if (!isNaN(numValue)) {
      onSave(value < 0 ? -Math.abs(numValue) : Math.abs(numValue));
    }
  };

  return (
    <Input
      type="number"
      value={editValue}
      onChange={handleChange}
      className="h-8 w-24 text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      autoFocus
      step="0.01"
    />
  );
}

export function EditableDateCell({ value, onSave }: EditableNumberCellProps) {
  const dateValue = value ? new Date(value) : null;
  const [editValue, setEditValue] = useState(
    dateValue ? format(dateValue, "yyyy-MM-dd") : "",
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

  return (
    <Input
      type="date"
      value={editValue}
      onChange={handleChange}
      className="h-8 w-36"
      autoFocus
    />
  );
}

export function EditableTextareaCell({
  value,
  onSave,
}: EditableStringCellProps) {
  return (
    <Textarea
      defaultValue={value || ""}
      onChange={(e) => onSave(e.target.value)}
      className="min-h-20 resize-none w-full"
      autoFocus
    />
  );
}

interface EditableSelectCellProps extends EditableStringCellProps {
  options: Array<{ value: string; label: string }>;
}

export function EditableSelectCell({
  value,
  onSave,
  options,
}: EditableSelectCellProps) {
  return (
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
  );
}

export function EditableProjectCell({
  value,
  onSave,
}: EditableStringCellProps) {
  return <SelectProject value={value} onValueChange={onSave} />;
}

export function EditableCategoryCell({
  value,
  onSave,
}: EditableStringCellProps) {
  return <SelectCategory value={value} onValueChange={onSave} />;
}

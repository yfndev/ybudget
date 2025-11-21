"use client";

import { SelectCategory } from "@/components/Selectors/SelectCategory";
import { SelectProject } from "@/components/Selectors/SelectProject";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { useEffect, useState } from "react";

interface EditableCellProps {
  value: any;
  onSave: (value: any) => void;
  onCancel: () => void;
  isEditing: boolean;
  onEdit: () => void;
  pendingValue?: any;
  displayValue?: string;
}

const convertToDate = (value: any): Date | null => {
  if (!value) return null;
  return typeof value === "number" ? new Date(value) : value;
};

const convertToTimestamp = (value: any): number | null => {
  if (!value) return null;
  if (typeof value === "number") return value;
  return value?.getTime() || null;
};

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
      handleCancel();
    }
  };

  const handleCancel = () => {
    setEditValue(value || "");
    onCancel();
  };

  if (isEditing) {
    return (
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
    );
  }

  return (
    <div
      className="cursor-pointer hover:bg-muted p-1 rounded"
      onDoubleClick={onEdit}
    >
      {value || ""}
    </div>
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
  const currentValue = pendingValue !== undefined ? pendingValue : value;
  const [editValue, setEditValue] = useState(
    Math.abs(currentValue || 0).toString(),
  );

  useEffect(() => {
    setEditValue(Math.abs(currentValue || 0).toString());
  }, [currentValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setEditValue(inputValue);
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      const keepSign = value < 0 ? -Math.abs(numValue) : Math.abs(numValue);
      onSave(keepSign);
    }
  };

  const handleEscape = () => {
    setEditValue(Math.abs(value || 0).toString());
    onCancel();
  };

  if (isEditing) {
    return (
      <Input
        type="number"
        value={editValue}
        onChange={handleChange}
        className="h-8 w-24 text-right"
        autoFocus
        step="0.01"
        onKeyDown={(e) => {
          if (e.key === "Escape") handleEscape();
        }}
      />
    );
  }

  return (
    <div
      className="cursor-pointer hover:bg-muted p-1 rounded text-right font-medium"
      onDoubleClick={onEdit}
    >
      {formatCurrency(currentValue)}
    </div>
  );
}

export function EditableDateCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
}: EditableCellProps) {
  const dateValue = convertToDate(value);
  const [editValue, setEditValue] = useState(
    dateValue ? format(dateValue, "yyyy-MM-dd") : "",
  );

  useEffect(() => {
    if (!isEditing) {
      const newDateValue = convertToDate(value);
      const formatted = newDateValue ? format(newDateValue, "yyyy-MM-dd") : "";
      setEditValue(formatted);
    }
  }, [value, isEditing]);

  const handleCancel = () => {
    const dateValue = convertToDate(value);
    setEditValue(dateValue ? format(dateValue, "yyyy-MM-dd") : "");
    onCancel();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    if (newValue) {
      const newDate = new Date(newValue);
      if (!isNaN(newDate.getTime())) {
        const newTimestamp = newDate.getTime();
        const currentTimestamp = convertToTimestamp(value);
        if (newTimestamp !== currentTimestamp) {
          onSave(newTimestamp);
        }
      }
    }
  };

  if (isEditing) {
    return (
      <Input
        type="date"
        value={editValue}
        onChange={handleDateChange}
        className="h-8 w-36"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Escape") handleCancel();
        }}
      />
    );
  }

  return (
    <div className="p-1">
      {dateValue ? format(dateValue, "dd.MM.yyyy") : ""}
    </div>
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
  const currentValue = pendingValue !== undefined ? pendingValue : value;
  const [editValue, setEditValue] = useState(currentValue || "");

  useEffect(() => {
    setEditValue(currentValue || "");
  }, [currentValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    onSave(newValue);
  };

  if (isEditing) {
    return (
      <Textarea
        value={editValue}
        onChange={handleChange}
        className="min-h-20 resize-none w-full"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setEditValue(value || "");
            onCancel();
          }
        }}
      />
    );
  }

  return (
    <div
      className="cursor-pointer hover:bg-muted p-1 rounded max-w-64 min-w-32"
      onDoubleClick={onEdit}
    >
      <div className="whitespace-pre-wrap text-muted-foreground break-words text-sm">
        {currentValue || ""}
      </div>
    </div>
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
  const [editValue, setEditValue] = useState(value || "");

  useEffect(() => {
    setEditValue(value || "");
  }, [value]);

  const handleValueChange = (newValue: string) => {
    setEditValue(newValue);
    if (newValue !== value) {
      onSave(newValue);
    }
  };

  const handleCancel = () => {
    setEditValue(value || "");
    onCancel();
  };

  const displayValue =
    options.find((opt) => opt.value === value)?.label || value || "";

  if (isEditing) {
    return (
      <Select value={editValue} onValueChange={handleValueChange}>
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

  return (
    <div
      className="cursor-pointer hover:bg-muted p-1 rounded"
      onDoubleClick={onEdit}
    >
      {displayValue}
    </div>
  );
}

export function EditableProjectCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
  pendingValue,
  displayValue,
}: EditableCellProps) {
  const currentValue = pendingValue !== undefined ? pendingValue : value;
  const [editValue, setEditValue] = useState(currentValue || "");

  useEffect(() => {
    setEditValue(currentValue || "");
  }, [currentValue]);

  const handleChange = (newValue: string) => {
    setEditValue(newValue);
    onSave(newValue);
  };

  if (isEditing) {
    return (
      <div className="w-48">
        <SelectProject value={editValue} onValueChange={handleChange} />
      </div>
    );
  }

  const displayText = displayValue || pendingValue || value || "";

  return (
    <div
      className="cursor-pointer hover:bg-muted p-1 rounded"
      onDoubleClick={onEdit}
    >
      {displayText}
    </div>
  );
}

export function EditableCategoryCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
  pendingValue,
  displayValue,
}: EditableCellProps) {
  const currentValue = pendingValue !== undefined ? pendingValue : value;
  const [editValue, setEditValue] = useState(currentValue || "");

  useEffect(() => {
    setEditValue(currentValue || "");
  }, [currentValue]);

  const handleChange = (newValue: string) => {
    setEditValue(newValue);
    onSave(newValue);
  };

  if (isEditing) {
    return (
      <div className="w-64">
        <SelectCategory value={editValue} onValueChange={handleChange} />
      </div>
    );
  }

  const displayText = displayValue || pendingValue || "";

  return (
    <div
      className="cursor-pointer hover:bg-muted p-1 rounded"
      onDoubleClick={onEdit}
    >
      {displayText}
    </div>
  );
}

export function EditableDateCellWithCalendar({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
  pendingValue,
}: EditableCellProps) {
  const valueDate = convertToDate(value);
  const pendingDate = convertToDate(pendingValue);
  const displayDate = pendingDate || valueDate;

  const valueTimestamp = convertToTimestamp(value);
  const pendingTimestamp = convertToTimestamp(pendingValue);

  const initialDate = pendingDate || valueDate || undefined;
  const [editValue, setEditValue] = useState<Date | undefined>(initialDate);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const currentTimestamp = pendingTimestamp ?? valueTimestamp;
    const currentEditTimestamp = editValue?.getTime();

    if (
      currentTimestamp !== null &&
      currentTimestamp !== undefined &&
      currentTimestamp !== currentEditTimestamp
    ) {
      const newDate = new Date(currentTimestamp);
      if (!isNaN(newDate.getTime())) {
        setEditValue(newDate);
      }
    }
  }, [pendingTimestamp, valueTimestamp, editValue]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setEditValue(date);
      setOpen(false);
      onSave(date.getTime());
    }
  };

  if (isEditing) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[200px] justify-start text-left font-normal"
          >
            {editValue ? format(editValue, "dd.MM.yyyy") : "Datum wählen..."}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={editValue}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }

  const formattedDate = displayDate ? format(displayDate, "dd.MM.yyyy") : "";

  return (
    <div
      className="cursor-pointer hover:bg-muted p-1 rounded"
      onDoubleClick={onEdit}
    >
      {formattedDate}
    </div>
  );
}

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

interface BaseEditableCellProps extends EditableCellProps {
  renderEditor: (value: any, onChange: (value: any) => void) => React.ReactNode;
  renderDisplay: (value: any) => React.ReactNode;
  getInitialValue?: (value: any, pendingValue?: any) => any;
  shouldAutoSave?: boolean;
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

function BaseEditableCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
  pendingValue,
  renderEditor,
  renderDisplay,
  getInitialValue,
  shouldAutoSave = false,
}: BaseEditableCellProps) {
  const currentValue = pendingValue !== undefined ? pendingValue : value;
  const [editValue, setEditValue] = useState(
    getInitialValue
      ? getInitialValue(currentValue, pendingValue)
      : currentValue || "",
  );

  useEffect(() => {
    const newValue = getInitialValue
      ? getInitialValue(currentValue, pendingValue)
      : currentValue || "";
    setEditValue(newValue);
  }, [currentValue]);

  const handleChange = (newValue: any) => {
    setEditValue(newValue);
    if (shouldAutoSave) {
      onSave(newValue);
    }
  };

  const handleCancel = () => {
    const resetValue = getInitialValue ? getInitialValue(value) : value || "";
    setEditValue(resetValue);
    onCancel();
  };

  if (isEditing) {
    return <>{renderEditor(editValue, handleChange)}</>;
  }

  return (
    <div
      className="cursor-pointer hover:bg-muted p-1 rounded"
      onDoubleClick={onEdit}
    >
      {renderDisplay(currentValue)}
    </div>
  );
}

export function EditableTextCell(props: EditableCellProps) {
  const [editValue, setEditValue] = useState(props.value || "");

  const handleSave = () => {
    if (editValue.trim()) {
      props.onSave(editValue.trim());
    } else {
      setEditValue(props.value || "");
      props.onCancel();
    }
  };

  if (props.isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setEditValue(props.value || "");
              props.onCancel();
            }
          }}
        />
        <Button size="sm" variant="ghost" onClick={handleSave}>
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setEditValue(props.value || "");
            props.onCancel();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer hover:bg-muted p-1 rounded"
      onDoubleClick={props.onEdit}
    >
      {props.value || ""}
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

export function EditableTextareaCell(props: EditableCellProps) {
  return (
    <BaseEditableCell
      {...props}
      shouldAutoSave
      renderEditor={(value, onChange) => (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-20 resize-none w-full"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Escape") props.onCancel();
          }}
        />
      )}
      renderDisplay={(value) => (
        <div className="max-w-64 min-w-32">
          <div className="whitespace-pre-wrap text-muted-foreground break-words text-sm">
            {value || ""}
          </div>
        </div>
      )}
    />
  );
}

interface EditableSelectCellProps extends EditableCellProps {
  options: { value: string; label: string }[];
}

export function EditableSelectCell(props: EditableSelectCellProps) {
  return (
    <BaseEditableCell
      {...props}
      shouldAutoSave
      renderEditor={(value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-8 w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {props.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      renderDisplay={() =>
        props.options.find((opt) => opt.value === props.value)?.label ||
        props.value ||
        ""
      }
    />
  );
}

export function EditableProjectCell(props: EditableCellProps) {
  return (
    <BaseEditableCell
      {...props}
      shouldAutoSave
      renderEditor={(value, onChange) => (
        <div className="w-48">
          <SelectProject value={value} onValueChange={onChange} />
        </div>
      )}
      renderDisplay={() =>
        props.displayValue || props.pendingValue || props.value || ""
      }
    />
  );
}

export function EditableCategoryCell(props: EditableCellProps) {
  return (
    <BaseEditableCell
      {...props}
      shouldAutoSave
      renderEditor={(value, onChange) => (
        <div className="w-64">
          <SelectCategory value={value} onValueChange={onChange} />
        </div>
      )}
      renderDisplay={() => props.displayValue || props.pendingValue || ""}
    />
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

  const toIsoString = (date: Date | null) =>
    date ? format(date, "yyyy-MM-dd") : "";

  const currentIsoValue = toIsoString(pendingDate) || toIsoString(valueDate);

  const handleDateChange = (isoDate: string) => {
    if (isoDate) {
      const newDate = new Date(isoDate);
      if (!isNaN(newDate.getTime())) {
        onSave(newDate.getTime());
      }
    }
  };

  if (isEditing) {
    return (
      <DateInput
        value={currentIsoValue}
        onChange={handleDateChange}
        className="h-8 w-36"
      />
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

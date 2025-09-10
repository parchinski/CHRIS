import type React from "react";

import { Input } from "@/components/ui/input";

interface EditableCellProps<T> {
  isEditing: boolean;
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  isSensitive?: boolean;
  renderDisplay?: () => React.ReactNode;
}

const EditableCell = <
  T extends string | number | readonly string[] | null | undefined,
>({
  isEditing,
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  isSensitive,
  renderDisplay,
}: EditableCellProps<T>) => {
  if (!isEditing) {
    const displayValue = value || "—";
    const sensitiveClasses = isSensitive
      ? "blur-sm hover:blur-none transition-all"
      : "";
    return (
      <div className={`${className || ""} ${sensitiveClasses}`}>
        {renderDisplay ? renderDisplay() : displayValue}
      </div>
    );
  }

  return (
    <Input
      value={(value as string | number | readonly string[] | undefined) ?? ""}
      onChange={(e) => onChange(e.target.value as T)}
      placeholder={placeholder}
      className={`h-8 bg-stone-950/70 border-stone-800 text-white ${
        inputClassName || ""
      }`}
    />
  );
};

export default EditableCell;

import type React from "react";

import { Textarea } from "@/components/ui/textarea";

interface EditableTextareaProps {
  isEditing: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const EditableTextarea: React.FC<EditableTextareaProps> = ({
  isEditing,
  value,
  onChange,
  placeholder,
}) => {
  if (!isEditing) {
    return <div className="text-white text-xs">{value || "—"}</div>;
  }

  return (
    <Textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-24 bg-stone-950/70 border-stone-800 text-white text-xs w-56"
    />
  );
};

export default EditableTextarea;

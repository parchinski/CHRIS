import type React from "react";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SHIRT_SIZES } from "@/schemas/userUpdateSchema";

interface EditableShirtSizeProps {
  isEditing: boolean;
  value: string;
  onChange: (value: string) => void;
}

const EditableShirtSize: React.FC<EditableShirtSizeProps> = ({
  isEditing,
  value,
  onChange,
}) => {
  if (!isEditing) {
    return <div className="text-white">{value || "—"}</div>;
  }

  return (
    <RadioGroup onValueChange={onChange} value={value ?? ""} className="gap-2">
      {SHIRT_SIZES.map((size) => (
        <div key={size} className="flex items-center gap-2">
          <RadioGroupItem
            value={size}
            id={`shirt-edit-${size}`}
            className="border-stone-600 data-[state=checked]:text-[hsl(var(--primary))]"
          />
          <label
            htmlFor={`shirt-edit-${size}`}
            className="m-0 cursor-pointer text-stone-300 text-xs"
          >
            {size}
          </label>
        </div>
      ))}
    </RadioGroup>
  );
};

export default EditableShirtSize;

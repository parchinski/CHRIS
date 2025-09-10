import type React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { AVAILABILITY_OPTIONS } from "@/schemas/userUpdateSchema";

interface EditableAvailabilityProps {
  isEditing: boolean;
  value: string[];
  onChange: (value: string[]) => void;
}

const EditableAvailability: React.FC<EditableAvailabilityProps> = ({
  isEditing,
  value,
  onChange,
}) => {
  if (!isEditing) {
    return (
      <div className="text-white">{value?.length ? value.join(", ") : "—"}</div>
    );
  }

  const handleCheckedChange = (checked: boolean, day: string) => {
    const newValue = checked
      ? [...(value || []), day]
      : (value || []).filter((v) => v !== day);
    onChange(newValue);
  };

  return (
    <div className="flex flex-col gap-2">
      {AVAILABILITY_OPTIONS.map((day) => (
        <label key={day} className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            className="border-stone-600 data-[state=checked]:text-[hsl(var(--primary))]"
            checked={value?.includes(day)}
            onCheckedChange={(checked) =>
              handleCheckedChange(Boolean(checked), day)
            }
          />
          <span className="text-stone-300 text-xs">{day}</span>
        </label>
      ))}
    </div>
  );
};

export default EditableAvailability;

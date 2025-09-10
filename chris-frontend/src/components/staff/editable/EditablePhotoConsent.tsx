import type React from "react";

import { Checkbox } from "@/components/ui/checkbox";

interface EditablePhotoConsentProps {
  isEditing: boolean;
  value: boolean;
  onChange: (value: boolean) => void;
}

const EditablePhotoConsent: React.FC<EditablePhotoConsentProps> = ({
  isEditing,
  value,
  onChange,
}) => {
  if (!isEditing) {
    return <div className="text-white">{value ? "Yes" : "No"}</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="can_take_photos_edit"
        className="border-stone-600 data-[state=checked]:text-[hsl(var(--primary))]"
        checked={value}
        onCheckedChange={(checked) => onChange(Boolean(checked))}
      />
    </div>
  );
};

export default EditablePhotoConsent;

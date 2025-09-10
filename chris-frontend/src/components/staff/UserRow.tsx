import React, { useMemo } from "react";
import { Edit3, X, Check, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ApiUser } from "./types";
import StaffAvatar from "./StaffAvatar";
import EditableCell from "./EditableCell";
import EditableAvailability from "./editable/EditableAvailability";
import EditablePhotoConsent from "./editable/EditablePhotoConsent";
import EditableShirtSize from "./editable/EditableShirtSize";
import EditableTextarea from "./editable/EditableTextarea";

interface UserRowProps {
  user: ApiUser;
  isEditing: boolean;
  userDraft: Partial<ApiUser>;
  onBeginEdit: () => void;
  onCancelEdit: () => void;
  onUserDraftChange: <K extends keyof ApiUser>(
    field: K,
    value: ApiUser[K],
  ) => void;
  onSaveUser: () => void;
  onDeleteUser: () => void;
}

const UserRow: React.FC<UserRowProps> = ({
  user,
  isEditing,
  userDraft,
  onBeginEdit,
  onCancelEdit,
  onUserDraftChange,
  onSaveUser,
  onDeleteUser,
}) => {
  const handleFieldChange = <K extends keyof ApiUser>(
    field: K,
    value: ApiUser[K],
  ) => {
    onUserDraftChange(field, value);
  };

  const hasChanges = useMemo(() => {
    if (Object.keys(userDraft).length === 0) {
      return false;
    }

    for (const key in userDraft) {
      const draftKey = key as keyof ApiUser;
      const userValue = user[draftKey];
      const draftValue = userDraft[draftKey];

      if (Array.isArray(userValue) && Array.isArray(draftValue)) {
        const userArray = userValue as string[];
        const draftArray = draftValue as string[];
        if (
          userArray.length !== draftArray.length ||
          !userArray.every((val) => draftArray.includes(val)) ||
          !draftArray.every((val) => userArray.includes(val))
        ) {
          return true;
        }
      } else if (userValue !== draftValue) {
        // Treat null/undefined and empty string as no change for string fields
        if (
          (userValue === null || userValue === undefined) &&
          draftValue === ""
        ) {
          continue;
        }
        return true;
      }
    }

    return false;
  }, [user, userDraft]);

  return (
    <tr className="bg-stone-900/50 hover:bg-stone-900/70 transition-colors align-top">
      <td className="px-4 py-3 flex flex-row items-center gap-3">
        <StaffAvatar userId={user.discord_id} className="w-10 h-10" />
        <div className="flex flex-col mr-16">
          <span className="font-medium text-white truncate">
            {user.username || "—"}
          </span>
          <button className="text-left focus:outline-none group">
            <span className="text-xs text-stone-400 group-focus:hidden blur-sm group-hover:blur-none transition-all">
              {user.sub?.slice(0, 3)}
              {user.sub && user.sub.length > 3 ? "..." : ""}
            </span>
            <span className="text-xs text-stone-400 hidden group-focus:inline">
              {user.sub}
            </span>
          </button>
        </div>
      </td>
      <td className="px-4 py-3 text-white">
        <div className="blur-sm hover:blur-none transition-all">
          {user.discord_id || "—"}
        </div>
      </td>
      <td className="px-4 py-3 text-white">
        <EditableCell
          isEditing={isEditing}
          value={userDraft.email ?? user.email}
          onChange={(val) => handleFieldChange("email", val)}
          isSensitive
          inputClassName="w-48"
        />
      </td>
      <td className="px-4 py-3 text-white">
        <EditableCell
          isEditing={isEditing}
          value={userDraft.name ?? user.name}
          onChange={(val) => handleFieldChange("name", val)}
          inputClassName="w-48"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {user.roles?.length ? (
            user.roles.map((r) => (
              <span
                key={r}
                className="px-2 py-0.5 rounded-md border border-stone-800/80 bg-stone-950/60 text-xs text-white"
              >
                {r}
              </span>
            ))
          ) : (
            <span className="text-stone-400">—</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <EditableCell
          isEditing={isEditing}
          value={userDraft.team_name ?? user.team_name}
          onChange={(val) => handleFieldChange("team_name", val)}
          placeholder="Team name or blank"
          inputClassName="h-8 w-48 sm:w-56"
        />
      </td>
      <td className="px-4 py-3 text-white">
        <EditableAvailability
          isEditing={isEditing}
          value={userDraft.availability ?? user.availability ?? []}
          onChange={(val) => handleFieldChange("availability", val)}
        />
      </td>
      <td className="px-4 py-3 text-white">
        <EditableShirtSize
          isEditing={isEditing}
          value={userDraft.shirt_size ?? user.shirt_size ?? ""}
          onChange={(val) => handleFieldChange("shirt_size", val)}
        />
      </td>
      <td className="px-4 py-3 text-white">
        <EditableTextarea
          isEditing={isEditing}
          value={
            userDraft.dietary_restrictions ?? user.dietary_restrictions ?? ""
          }
          onChange={(val) => handleFieldChange("dietary_restrictions", val)}
        />
      </td>
      <td className="px-4 py-3 text-white">
        <EditableTextarea
          isEditing={isEditing}
          value={userDraft.notes ?? user.notes ?? ""}
          onChange={(val) => handleFieldChange("notes", val)}
        />
      </td>
      <td className="px-4 py-3 text-white">
        <EditablePhotoConsent
          isEditing={isEditing}
          value={userDraft.can_take_photos ?? user.can_take_photos ?? false}
          onChange={(val) => handleFieldChange("can_take_photos", val)}
        />
      </td>
      <td className="px-4 py-3">
        {!isEditing ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={onBeginEdit}
              className="h-8 px-3 text-white border-stone-800 bg-stone-950/60 hover:bg-stone-950/70"
              variant="outline"
              size="sm"
            >
              <Edit3 className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-white border-stone-800 hover:bg-stone-950/60"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete user?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove {user.username || "this user"}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeleteUser}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="h-8 px-3 bg-white text-black hover:opacity-90"
              onClick={onSaveUser}
              disabled={!hasChanges}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancelEdit}
              className="h-8 px-3 text-white border-stone-800 hover:bg-stone-950/60"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default UserRow;

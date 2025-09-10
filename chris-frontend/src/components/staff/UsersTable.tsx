import type React from "react";

import type { ApiUser } from "./types";
import UserRow from "./UserRow";

interface UsersTableProps {
  users: ApiUser[];
  loading: boolean;
  editingId: number | null;
  userDrafts: Record<number, Partial<ApiUser>>;
  onBeginEdit: (user: ApiUser) => void;
  onCancelEdit: (id?: number) => void;
  onUserDraftChange: (userId: number, field: keyof ApiUser, value: any) => void;
  onSaveUser: (userId: number) => void;
  onDeleteUser: (userId: number) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  editingId,
  userDrafts,
  onBeginEdit,
  onCancelEdit,
  onUserDraftChange,
  onSaveUser,
  onDeleteUser,
}) => {
  return (
    <div className="relative overflow-x-auto rounded-lg border border-stone-800/70">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 z-10 bg-stone-950/70 text-stone-300">
          <tr className="[&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium">
            <th>User</th>
            <th>Discord</th>
            <th>Email</th>
            <th>Name</th>
            <th>Roles</th>
            <th className="w-56">Team</th>
            <th>Availability</th>
            <th>Shirt</th>
            <th>Dietary</th>
            <th>Notes</th>
            <th>Photos</th>
            <th className="w-56">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-800/80">
          {users.length === 0 && (
            <tr>
              <td colSpan={12} className="px-4 py-6 text-center text-stone-400">
                {loading ? "Loading…" : "No users found"}
              </td>
            </tr>
          )}
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              isEditing={editingId === user.id}
              userDraft={userDrafts[user.id] || {}}
              onBeginEdit={() => onBeginEdit(user)}
              onCancelEdit={() => onCancelEdit(user.id)}
              onUserDraftChange={(field, value) =>
                onUserDraftChange(user.id, field, value)
              }
              onSaveUser={() => onSaveUser(user.id)}
              onDeleteUser={() => onDeleteUser(user.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;

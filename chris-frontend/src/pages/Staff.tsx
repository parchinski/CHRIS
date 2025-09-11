import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import type { ApiUser, Tab } from "@/components/staff/types";
import { del, get, patch } from "@/services/api";
import { adminUserUpdateSchema } from "@/schemas/adminUserUpdateSchema";
import StaffHeader from "@/components/staff/StaffHeader";
import SearchAndTabs from "@/components/staff/SearchAndTabs";
const UsersTable = React.lazy(() => import("@/components/staff/UsersTable"));
const AdminTeamManagement = React.lazy(
  () => import("@/components/staff/AdminTeamManagement"),
);

const Staff: React.FC = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("users");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [userDrafts, setUserDrafts] = useState<
    Record<number, Partial<ApiUser>>
  >({});
  const didFetch = useRef(false);

  const fetchUsers = async (withToast = false) => {
    if (loading) return;
    setLoading(true);
    const p = withToast
      ? toast.loading("Loading users…", { duration: Infinity })
      : undefined;
    try {
      const list = await get<ApiUser[]>("/staff/users");
      setUsers(Array.isArray(list) ? list : []);
      if (withToast) toast.success("Users loaded", { id: p });
    } catch (e: any) {
      const msg = e?.message || "Failed to load users";
      if (withToast) toast.error(msg, { id: p });
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchUsers(false);
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((u) => {
      const hay = [
        u.username,
        u.email || "",
        u.name || "",
        u.discord_id,
        u.team_name || "",
        (u.availability || []).join(", "),
        u.shirt_size || "",
        u.dietary_restrictions || "",
        u.notes || "",
        u.roles.join(", "),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [users, q]);

  const teamsGrouped = useMemo(() => {
    const map = new Map<string, ApiUser[]>();
    for (const u of filtered) {
      const key = u.team_name || "— Unassigned";
      const arr = map.get(key) || [];
      arr.push(u);
      map.set(key, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) =>
      a === "— Unassigned" ? -1 : a.localeCompare(b),
    );
  }, [filtered]);

  const beginEdit = (u: ApiUser) => {
    setEditingId(u.id);
    setUserDrafts((prev) => ({ ...prev, [u.id]: {} }));
  };
  const cancelEdit = (id?: number) => {
    setEditingId(null);
    if (id != null) {
      setUserDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleUserDraftChange = (
    userId: number,
    field: keyof ApiUser,
    value: any,
  ) => {
    setUserDrafts((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
  };

  const saveUser = async (userId: number) => {
    const draft = userDrafts[userId];
    if (!draft) return;

    // Validate draft client-side
    const parsed = adminUserUpdateSchema.safeParse(draft);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      toast.error("Invalid input", {
        description: issue?.message || "Please review the fields",
      });
      return;
    }

    // If team_name is provided, ensure the team exists before patching
    const payload = parsed.data;
    if (typeof payload.team_name === "string" && payload.team_name.length > 0) {
      try {
        const check = await get<{ name: string; exists: boolean }>(
          `/teams/check/${encodeURIComponent(payload.team_name)}`,
        );
        if (!check.exists) {
          toast.error("Team does not exist", {
            description: `Cannot assign to '${payload.team_name}'.`,
          });
          return;
        }
      } catch (e: any) {
        toast.error(e?.message || "Failed to verify team");
        return;
      }
    }

    const p = toast.loading("Updating user…", { duration: Infinity });
    try {
      const updated = await patch<ApiUser>(`/staff/users/${userId}`, payload);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)),
      );
      toast.success("User updated", { id: p });
      cancelEdit(userId);
    } catch (e: any) {
      toast.error(e?.message || "Update failed", { id: p });
    }
  };

  const deleteUser = async (userId: number) => {
    const p = toast.loading("Deleting user…", { duration: Infinity });
    try {
      await del<void>(`/staff/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User deleted", { id: p });
    } catch (e: any) {
      toast.error(e?.message || "Delete failed", { id: p });
    }
  };

  return (
    <div className="w-fill space-y-6 mx-auto">
      <StaffHeader onRefresh={() => fetchUsers(true)} loading={loading} />

      <div className="rounded-xl border border-stone-800/80 bg-stone-900/70 p-4 cyber-ring space-y-4">
        <SearchAndTabs tab={tab} setTab={setTab} q={q} setQ={setQ} />

        <div className="mt-6">
          {tab === "users" ? (
            <React.Suspense
              fallback={<div className="text-center p-8">Loading users...</div>}
            >
              <UsersTable
                users={filtered}
                loading={loading}
                editingId={editingId}
                userDrafts={userDrafts}
                onBeginEdit={beginEdit}
                onCancelEdit={cancelEdit}
                onUserDraftChange={handleUserDraftChange}
                onSaveUser={saveUser}
                onDeleteUser={deleteUser}
              />
            </React.Suspense>
          ) : (
            <React.Suspense
              fallback={<div className="text-center p-8">Loading teams...</div>}
            >
              <AdminTeamManagement />
            </React.Suspense>
          )}
        </div>
      </div>
    </div>
  );
};

export default Staff;

"use client";

import type { UserSummary } from "@/types";
import { useUsers } from "@/hooks/useUsers";
import { useActingUser } from "@/context/ActingUserContext";
import { Select } from "@/components/ui/Select";

export function ActingUserSelect() {
  const { users, loading } = useUsers();
  const { actingUserId, setActingUserId, resolveActingUser } = useActingUser();

  if (loading && users.length === 0) {
    return <p className="text-sm text-slate-600">Loading users...</p>;
  }

  const selectedUser = resolveActingUser(users);

  return (
    <div className="w-56">
      <Select
        label="Acting as"
        name="actingUser"
        value={actingUserId ?? selectedUser?.id ?? ""}
        onChange={(event) => setActingUserId(event.target.value)}
        options={users.map((user: UserSummary) => ({
          value: user.id,
          label: user.name,
        }))}
      />
    </div>
  );
}

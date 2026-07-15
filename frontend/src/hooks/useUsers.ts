import { ApiError } from "@/lib/errors";
import { listUsers } from "@/lib/api/users";
import type { UserSummary } from "@/types";
import { useCallback, useEffect, useState } from "react";

interface UseUsersResult {
  users: UserSummary[];
  loading: boolean;
  error: ApiError | null;
  reload: () => Promise<void>;
}

export function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await listUsers();
      setUsers(data);
    } catch (err) {
      setUsers([]);
      setError(err instanceof ApiError ? err : new ApiError(500, "UNKNOWN_ERROR", "Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { users, loading, error, reload };
}

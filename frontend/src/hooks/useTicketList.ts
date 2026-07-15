import { ApiError } from "@/lib/errors";
import type { TicketListItem } from "@/types";
import { listTickets, type ListTicketsParams } from "@/lib/api/tickets";
import { useCallback, useEffect, useState } from "react";

interface UseTicketListResult {
  tickets: TicketListItem[];
  loading: boolean;
  error: ApiError | null;
  reload: () => Promise<void>;
}

export function useTicketList(params: ListTicketsParams): UseTicketListResult {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await listTickets(params);
      setTickets(data);
    } catch (err) {
      setTickets([]);
      setError(err instanceof ApiError ? err : new ApiError(500, "UNKNOWN_ERROR", "Failed to load tickets"));
    } finally {
      setLoading(false);
    }
  }, [params.search, params.status]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { tickets, loading, error, reload };
}

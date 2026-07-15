import { ApiError } from "@/lib/errors";
import { getTicket } from "@/lib/api/tickets";
import type { TicketDetail } from "@/types";
import { useCallback, useEffect, useState } from "react";

interface UseTicketResult {
  ticket: TicketDetail | null;
  loading: boolean;
  error: ApiError | null;
  reload: () => Promise<void>;
  setTicket: (ticket: TicketDetail) => void;
}

export function useTicket(ticketId: string): UseTicketResult {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTicket(ticketId);
      setTicket(data);
    } catch (err) {
      setTicket(null);
      setError(err instanceof ApiError ? err : new ApiError(500, "UNKNOWN_ERROR", "Failed to load ticket"));
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { ticket, loading, error, reload, setTicket };
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TicketFilters } from "@/components/tickets/TicketFilters";
import { TicketTable } from "@/components/tickets/TicketTable";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTicketList } from "@/hooks/useTicketList";
import type { TicketStatus } from "@/types";

const primaryLinkClassName =
  "inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700";

export function TicketListView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: (status || undefined) as TicketStatus | undefined,
    }),
    [debouncedSearch, status],
  );

  const { tickets, loading, error, reload } = useTicketList(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tickets"
        description="Search and filter all support tickets."
        action={
          <Link href="/tickets/new" className={primaryLinkClassName}>
            New Ticket
          </Link>
        }
      />

      <TicketFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      {error ? <ErrorBanner message={error.message} onRetry={() => void reload()} /> : null}

      {loading ? (
        <LoadingSpinner label="Loading tickets..." />
      ) : (
        <TicketTable tickets={tickets} />
      )}
    </div>
  );
}

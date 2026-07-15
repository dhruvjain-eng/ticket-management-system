"use client";

import Link from "next/link";
import { DashboardStats, RecentTickets } from "@/components/tickets/DashboardPanels";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTicketList } from "@/hooks/useTicketList";

const primaryLinkClassName =
  "inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700";

export function DashboardView() {
  const { tickets, loading, error, reload } = useTicketList({});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of support tickets and recent activity."
        action={
          <Link href="/tickets/new" className={primaryLinkClassName}>
            New Ticket
          </Link>
        }
      />

      {error ? <ErrorBanner message={error.message} onRetry={() => void reload()} /> : null}

      {loading ? (
        <LoadingSpinner label="Loading dashboard..." />
      ) : (
        <>
          <DashboardStats tickets={tickets} />
          <RecentTickets tickets={tickets} />
        </>
      )}
    </div>
  );
}

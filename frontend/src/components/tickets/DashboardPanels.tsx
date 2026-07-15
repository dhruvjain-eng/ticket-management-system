import Link from "next/link";
import { formatStatusLabel } from "@/lib/labels";
import type { TicketListItem, TicketStatus } from "@/types";
import { TicketStatus as TicketStatusEnum } from "@/types";

interface DashboardStatsProps {
  tickets: TicketListItem[];
}

export function DashboardStats({ tickets }: DashboardStatsProps) {
  const counts = Object.values(TicketStatusEnum).reduce<Record<TicketStatus, number>>(
    (acc, status) => {
      acc[status] = tickets.filter((ticket) => ticket.status === status).length;
      return acc;
    },
    {} as Record<TicketStatus, number>,
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">Total Tickets</p>
        <p className="mt-2 text-3xl font-semibold text-slate-900">{tickets.length}</p>
      </div>
      {Object.values(TicketStatusEnum).map((status) => (
        <div key={status} className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">{formatStatusLabel(status)}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{counts[status]}</p>
        </div>
      ))}
    </div>
  );
}

interface RecentTicketsProps {
  tickets: TicketListItem[];
}

export function RecentTickets({ tickets }: RecentTicketsProps) {
  const recent = [...tickets]
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Recent Tickets</h2>
        <Link href="/tickets" className="text-sm font-medium text-slate-700 hover:underline">
          View all
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-slate-600">No tickets yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {recent.map((ticket) => (
            <li key={ticket.id} className="py-3">
              <Link
                href={`/tickets/${ticket.id}`}
                className="font-medium text-slate-900 hover:underline"
              >
                {ticket.title}
              </Link>
              <p className="mt-1 text-sm text-slate-600">
                {formatStatusLabel(ticket.status)} · {ticket.createdBy.name}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

import { formatDateTime } from "@/lib/labels";
import type { TicketDetail } from "@/types";
import { PriorityBadge, StatusBadge } from "./TicketBadges";

interface TicketDetailHeaderProps {
  ticket: TicketDetail;
}

export function TicketDetailHeader({ ticket }: TicketDetailHeaderProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">{ticket.title}</h1>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>
        <div className="text-sm text-slate-600">
          <p>Created {formatDateTime(ticket.createdAt)}</p>
          <p>Updated {formatDateTime(ticket.updatedAt)}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-slate-500">Creator</dt>
          <dd className="mt-1 text-slate-900">{ticket.createdBy.name}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Assignee</dt>
          <dd className="mt-1 text-slate-900">
            {ticket.assignedTo?.name ?? "Unassigned"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium text-slate-500">Description</dt>
          <dd className="mt-1 whitespace-pre-wrap text-slate-900">
            {ticket.description}
          </dd>
        </div>
      </dl>
    </section>
  );
}

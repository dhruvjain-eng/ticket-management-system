import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/labels";
import type { TicketListItem } from "@/types";
import { PriorityBadge, StatusBadge } from "./TicketBadges";

interface TicketTableProps {
  tickets: TicketListItem[];
}

export function TicketTable({ tickets }: TicketTableProps) {
  if (tickets.length === 0) {
    return (
      <EmptyState
        title="No tickets found"
        description="Try adjusting your search or status filter."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Priority</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Assignee</th>
            <th className="px-4 py-3 font-medium">Created By</th>
            <th className="px-4 py-3 font-medium">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {ticket.title}
                </Link>
              </td>
              <td className="px-4 py-3">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-4 py-3 text-slate-700">
                {ticket.assignedTo?.name ?? "Unassigned"}
              </td>
              <td className="px-4 py-3 text-slate-700">{ticket.createdBy.name}</td>
              <td className="px-4 py-3 text-slate-600">
                {formatDateTime(ticket.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

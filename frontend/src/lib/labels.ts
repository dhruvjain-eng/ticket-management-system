import type { TicketPriority, TicketStatus } from "@/types";

export function formatStatusLabel(status: TicketStatus): string {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatPriorityLabel(priority: TicketPriority): string {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export const statusBadgeClasses: Record<TicketStatus, string> = {
  OPEN: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-slate-200 text-slate-700",
  CANCELLED: "bg-red-100 text-red-800",
};

export const priorityBadgeClasses: Record<TicketPriority, string> = {
  LOW: "bg-slate-200 text-slate-700",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

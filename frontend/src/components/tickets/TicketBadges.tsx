import { Badge } from "@/components/ui/Badge";
import {
  formatPriorityLabel,
  formatStatusLabel,
  priorityBadgeClasses,
  statusBadgeClasses,
} from "@/lib/labels";
import type { TicketPriority, TicketStatus } from "@/types";

interface StatusBadgeProps {
  status: TicketStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge
      label={formatStatusLabel(status)}
      className={statusBadgeClasses[status]}
    />
  );
}

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <Badge
      label={formatPriorityLabel(priority)}
      className={priorityBadgeClasses[priority]}
    />
  );
}

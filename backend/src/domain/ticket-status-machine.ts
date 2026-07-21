import { TicketStatus } from "../../generated/prisma/client.js";

const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED, TicketStatus.CANCELLED],
  [TicketStatus.RESOLVED]: [TicketStatus.CLOSED],
  [TicketStatus.CLOSED]: [],
  [TicketStatus.CANCELLED]: [],
};

export function getAllowedTransitions(currentStatus: TicketStatus): TicketStatus[] {
  return ALLOWED_TRANSITIONS[currentStatus];
}

export function canTransition(
  currentStatus: TicketStatus,
  nextStatus: TicketStatus,
): boolean {
  return getAllowedTransitions(currentStatus).includes(nextStatus);
}

export function formatAllowedTransitions(statuses: TicketStatus[]): string {
  return statuses.length > 0 ? statuses.join(", ") : "none";
}

import { TicketStatus, type TicketStatus as TicketStatusType } from "@/types";

export const ALLOWED_TRANSITIONS: Record<TicketStatusType, TicketStatusType[]> = {
  [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED, TicketStatus.CANCELLED],
  [TicketStatus.RESOLVED]: [TicketStatus.CLOSED],
  [TicketStatus.CLOSED]: [],
  [TicketStatus.CANCELLED]: [],
};

export function getAllowedTransitions(
  currentStatus: TicketStatusType,
): TicketStatusType[] {
  return ALLOWED_TRANSITIONS[currentStatus];
}

export function canTransition(
  currentStatus: TicketStatusType,
  nextStatus: TicketStatusType,
): boolean {
  return getAllowedTransitions(currentStatus).includes(nextStatus);
}

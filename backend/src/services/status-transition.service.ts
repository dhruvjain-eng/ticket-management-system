import { TicketStatus } from "../../generated/prisma/client.js";
import {
  canTransition,
  formatAllowedTransitions,
  getAllowedTransitions,
} from "../domain/ticket-status-machine.js";
import { prisma } from "../lib/prisma.js";
import type { TicketDetail } from "../types/ticket.js";
import { AppError } from "../utils/app-error.js";
import { toTicketDetail } from "../utils/ticket.mapper.js";

export { canTransition, getAllowedTransitions } from "../domain/ticket-status-machine.js";

const userRefSelect = {
  select: {
    id: true,
    name: true,
  },
} as const;

const ticketDetailInclude = {
  assignedTo: userRefSelect,
  createdBy: userRefSelect,
  comments: {
    orderBy: { createdAt: "asc" as const },
    select: {
      id: true,
      message: true,
      createdAt: true,
      createdBy: userRefSelect,
    },
  },
} as const;

function buildInvalidTransitionError(
  currentStatus: TicketStatus,
  nextStatus: TicketStatus,
): AppError {
  const allowed = getAllowedTransitions(currentStatus);
  const allowedLabel = formatAllowedTransitions(allowed);

  const message =
    allowed.length === 0
      ? `Cannot transition from '${currentStatus}' to '${nextStatus}'. '${currentStatus}' is a terminal status.`
      : `Cannot transition from '${currentStatus}' to '${nextStatus}'. Allowed transitions: ${allowedLabel}.`;

  return new AppError(400, "INVALID_STATUS_TRANSITION", message, [
    {
      field: "status",
      message: `Allowed transitions from ${currentStatus}: ${allowedLabel}`,
    },
  ]);
}

export async function transitionTicketStatus(
  ticketId: string,
  nextStatus: TicketStatus,
): Promise<TicketDetail> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, status: true },
  });

  if (!ticket) {
    throw new AppError(404, "NOT_FOUND", "Ticket not found");
  }

  if (ticket.status === nextStatus) {
    const unchanged = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: ticketDetailInclude,
    });
    return toTicketDetail(unchanged!);
  }

  if (!canTransition(ticket.status, nextStatus)) {
    throw buildInvalidTransitionError(ticket.status, nextStatus);
  }

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: nextStatus },
    include: ticketDetailInclude,
  });

  return toTicketDetail(updated);
}

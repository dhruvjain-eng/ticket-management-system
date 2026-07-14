import { TicketStatus } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { TicketDetail, TicketListItem } from "../types/ticket.js";
import { AppError } from "../utils/app-error.js";
import { toTicketDetail, toTicketListItem } from "../utils/ticket.mapper.js";
import type {
  CreateTicketBody,
  ListTicketsQuery,
  UpdateTicketBody,
} from "../validators/ticket.validator.js";

const userRefSelect = {
  select: {
    id: true,
    name: true,
  },
} as const;

const ticketRelationsInclude = {
  assignedTo: userRefSelect,
  createdBy: userRefSelect,
} as const;

const ticketDetailInclude = {
  ...ticketRelationsInclude,
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

async function assertUserExists(userId: string, field: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(400, "INVALID_REFERENCE", "Referenced user does not exist", [
      { field, message: "User not found" },
    ]);
  }
}

export async function listTickets(query: ListTicketsQuery): Promise<TicketListItem[]> {
  const tickets = await prisma.ticket.findMany({
    where: {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" } },
              { description: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: ticketRelationsInclude,
  });

  return tickets.map(toTicketListItem);
}

export async function getTicketById(id: string): Promise<TicketDetail> {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: ticketDetailInclude,
  });

  if (!ticket) {
    throw new AppError(404, "NOT_FOUND", "Ticket not found");
  }

  return toTicketDetail(ticket);
}

export async function createTicket(input: CreateTicketBody): Promise<TicketDetail> {
  await assertUserExists(input.createdById, "createdById");

  if (input.assignedToId) {
    await assertUserExists(input.assignedToId, "assignedToId");
  }

  const ticket = await prisma.ticket.create({
    data: {
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: TicketStatus.OPEN,
      createdById: input.createdById,
      assignedToId: input.assignedToId ?? null,
    },
    include: ticketDetailInclude,
  });

  return toTicketDetail(ticket);
}

export async function updateTicket(
  id: string,
  input: UpdateTicketBody,
): Promise<TicketDetail> {
  const existing = await prisma.ticket.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError(404, "NOT_FOUND", "Ticket not found");
  }

  if (input.assignedToId) {
    await assertUserExists(input.assignedToId, "assignedToId");
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.assignedToId !== undefined
        ? { assignedToId: input.assignedToId }
        : {}),
    },
    include: ticketDetailInclude,
  });

  return toTicketDetail(ticket);
}

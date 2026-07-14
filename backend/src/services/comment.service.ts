import { prisma } from "../lib/prisma.js";
import type { TicketComment } from "../types/ticket.js";
import { AppError } from "../utils/app-error.js";
import type { CreateCommentBody } from "../validators/comment.validator.js";

const userRefSelect = {
  select: {
    id: true,
    name: true,
  },
} as const;

function toComment(comment: {
  id: string;
  message: string;
  createdAt: Date;
  createdBy: { id: string; name: string };
}): TicketComment {
  return {
    id: comment.id,
    message: comment.message,
    createdBy: {
      id: comment.createdBy.id,
      name: comment.createdBy.name,
    },
    createdAt: comment.createdAt.toISOString(),
  };
}

export async function createComment(
  ticketId: string,
  input: CreateCommentBody,
): Promise<TicketComment> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true },
  });

  if (!ticket) {
    throw new AppError(404, "NOT_FOUND", "Ticket not found");
  }

  const author = await prisma.user.findUnique({
    where: { id: input.createdById },
    select: { id: true },
  });

  if (!author) {
    throw new AppError(400, "INVALID_REFERENCE", "Referenced user does not exist", [
      { field: "createdById", message: "User not found" },
    ]);
  }

  const comment = await prisma.comment.create({
    data: {
      message: input.message,
      ticketId,
      createdById: input.createdById,
    },
    select: {
      id: true,
      message: true,
      createdAt: true,
      createdBy: userRefSelect,
    },
  });

  return toComment(comment);
}

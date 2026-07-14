import type { TicketDetail, TicketListItem, UserRef } from "../types/ticket.js";

interface UserNameRecord {
  id: string;
  name: string;
}

interface TicketRecord {
  id: string;
  title: string;
  description: string;
  priority: TicketListItem["priority"];
  status: TicketListItem["status"];
  createdAt: Date;
  updatedAt: Date;
  assignedTo: UserNameRecord | null;
  createdBy: UserNameRecord;
  comments?: Array<{
    id: string;
    message: string;
    createdAt: Date;
    createdBy: UserNameRecord;
  }>;
}

function toUserRef(user: UserNameRecord | null): UserRef | null {
  if (!user) {
    return null;
  }

  return { id: user.id, name: user.name };
}

export function toTicketListItem(ticket: TicketRecord): TicketListItem {
  return {
    id: ticket.id,
    title: ticket.title,
    priority: ticket.priority,
    status: ticket.status,
    assignedTo: toUserRef(ticket.assignedTo),
    createdBy: toUserRef(ticket.createdBy)!,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  };
}

export function toTicketDetail(ticket: TicketRecord): TicketDetail {
  return {
    ...toTicketListItem(ticket),
    description: ticket.description,
    comments: (ticket.comments ?? []).map((comment) => ({
      id: comment.id,
      message: comment.message,
      createdBy: toUserRef(comment.createdBy)!,
      createdAt: comment.createdAt.toISOString(),
    })),
  };
}

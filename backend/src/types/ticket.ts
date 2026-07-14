import type { TicketPriority, TicketStatus } from "../../generated/prisma/client.js";

export interface UserRef {
  id: string;
  name: string;
}

export interface TicketComment {
  id: string;
  message: string;
  createdBy: UserRef;
  createdAt: string;
}

export interface TicketListItem {
  id: string;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: UserRef | null;
  createdBy: UserRef;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDetail extends TicketListItem {
  description: string;
  comments: TicketComment[];
}

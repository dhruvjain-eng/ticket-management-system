import type { TicketPriority, TicketStatus, UserRole } from "./enums";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface UserRef {
  id: string;
  name: string;
}

export interface Comment {
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
  comments: Comment[];
}

import type {
  ApiListResponse,
  ApiSuccessResponse,
  Comment,
  TicketDetail,
  TicketListItem,
  TicketPriority,
  TicketStatus,
} from "@/types";
import { apiGet, apiPatch, apiPost } from "../api-client";

export interface ListTicketsParams {
  search?: string;
  status?: TicketStatus;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
  createdById: string;
  assignedToId?: string;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  priority?: TicketPriority;
  assignedToId?: string | null;
}

export interface CreateCommentInput {
  message: string;
  createdById: string;
}

function buildQuery(params: ListTicketsParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function listTickets(
  params: ListTicketsParams = {},
): Promise<TicketListItem[]> {
  const response = await apiGet<ApiListResponse<TicketListItem>>(
    `/tickets${buildQuery(params)}`,
  );

  return response.data;
}

export async function getTicket(ticketId: string): Promise<TicketDetail> {
  const response = await apiGet<ApiSuccessResponse<TicketDetail>>(
    `/tickets/${ticketId}`,
  );

  return response.data;
}

export async function createTicket(
  input: CreateTicketInput,
): Promise<TicketDetail> {
  const response = await apiPost<ApiSuccessResponse<TicketDetail>>(
    "/tickets",
    input,
  );

  return response.data;
}

export async function updateTicket(
  ticketId: string,
  input: UpdateTicketInput,
): Promise<TicketDetail> {
  const response = await apiPatch<ApiSuccessResponse<TicketDetail>>(
    `/tickets/${ticketId}`,
    input,
  );

  return response.data;
}

export async function transitionTicketStatus(
  ticketId: string,
  status: TicketStatus,
): Promise<TicketDetail> {
  const response = await apiPatch<ApiSuccessResponse<TicketDetail>>(
    `/tickets/${ticketId}/status`,
    { status },
  );

  return response.data;
}

export async function addComment(
  ticketId: string,
  input: CreateCommentInput,
): Promise<Comment> {
  const response = await apiPost<ApiSuccessResponse<Comment>>(
    `/tickets/${ticketId}/comments`,
    input,
  );

  return response.data;
}

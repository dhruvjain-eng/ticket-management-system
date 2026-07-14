import type { Request, Response } from "express";
import * as statusTransitionService from "../services/status-transition.service.js";
import * as ticketService from "../services/ticket.service.js";
import { getValidated } from "../utils/get-validated.js";
import type {
  CreateTicketBody,
  ListTicketsQuery,
  UpdateTicketBody,
  UpdateTicketStatusBody,
} from "../validators/ticket.validator.js";

export async function listTickets(_req: Request, res: Response): Promise<void> {
  const query = getValidated<ListTicketsQuery>(res, "query");
  const tickets = await ticketService.listTickets(query);

  res.status(200).json({
    data: tickets,
    meta: { count: tickets.length },
  });
}

export async function getTicketById(_req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(res, "params");
  const ticket = await ticketService.getTicketById(id);

  res.status(200).json({ data: ticket });
}

export async function createTicket(_req: Request, res: Response): Promise<void> {
  const body = getValidated<CreateTicketBody>(res, "body");
  const ticket = await ticketService.createTicket(body);

  res.status(201).json({ data: ticket });
}

export async function updateTicket(_req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(res, "params");
  const body = getValidated<UpdateTicketBody>(res, "body");
  const ticket = await ticketService.updateTicket(id, body);

  res.status(200).json({ data: ticket });
}

export async function transitionTicketStatus(
  _req: Request,
  res: Response,
): Promise<void> {
  const { id } = getValidated<{ id: string }>(res, "params");
  const { status } = getValidated<UpdateTicketStatusBody>(res, "body");
  const ticket = await statusTransitionService.transitionTicketStatus(id, status);

  res.status(200).json({ data: ticket });
}

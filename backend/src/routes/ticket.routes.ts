import { Router } from "express";
import {
  createTicket,
  getTicketById,
  listTickets,
  transitionTicketStatus,
  updateTicket,
} from "../controllers/ticket.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { uuidParamSchema } from "../validators/common.validator.js";
import {
  createTicketBodySchema,
  listTicketsQuerySchema,
  updateTicketBodySchema,
  updateTicketStatusBodySchema,
} from "../validators/ticket.validator.js";

export const ticketRoutes = Router();

ticketRoutes.get(
  "/",
  validate({ query: listTicketsQuerySchema }),
  asyncHandler(listTickets),
);

ticketRoutes.post(
  "/",
  validate({ body: createTicketBodySchema }),
  asyncHandler(createTicket),
);

ticketRoutes.patch(
  "/:id/status",
  validate({ params: uuidParamSchema, body: updateTicketStatusBodySchema }),
  asyncHandler(transitionTicketStatus),
);

ticketRoutes.get(
  "/:id",
  validate({ params: uuidParamSchema }),
  asyncHandler(getTicketById),
);

ticketRoutes.patch(
  "/:id",
  validate({ params: uuidParamSchema, body: updateTicketBodySchema }),
  asyncHandler(updateTicket),
);

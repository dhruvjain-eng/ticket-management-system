import { z } from "zod";
import { TicketPriority, TicketStatus } from "../../generated/prisma/client.js";

const trimmedString = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, { message: `Must be at least ${min} character(s)` })
    .max(max, { message: `Must be at most ${max} characters` });

export const listTicketsQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(200, { message: "Search must be at most 200 characters" })
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  status: z.nativeEnum(TicketStatus).optional(),
});

export const createTicketBodySchema = z.object({
  title: trimmedString(1, 200),
  description: trimmedString(1, 10_000),
  priority: z.nativeEnum(TicketPriority),
  createdById: z.string().uuid({ message: "Invalid createdById" }),
  assignedToId: z.string().uuid({ message: "Invalid assignedToId" }).optional(),
});

export const updateTicketBodySchema = z
  .object({
    title: trimmedString(1, 200).optional(),
    description: trimmedString(1, 10_000).optional(),
    priority: z.nativeEnum(TicketPriority).optional(),
    assignedToId: z
      .string()
      .uuid({ message: "Invalid assignedToId" })
      .nullable()
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const updateTicketStatusBodySchema = z.object({
  status: z.nativeEnum(TicketStatus, { message: "Invalid status value" }),
});

export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;
export type CreateTicketBody = z.infer<typeof createTicketBodySchema>;
export type UpdateTicketBody = z.infer<typeof updateTicketBodySchema>;
export type UpdateTicketStatusBody = z.infer<typeof updateTicketStatusBodySchema>;

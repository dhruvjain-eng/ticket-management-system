import { TicketPriority, TicketStatus } from "../../generated/prisma/client.js";
import {
  createTicketBodySchema,
  listTicketsQuerySchema,
  updateTicketBodySchema,
  updateTicketStatusBodySchema,
} from "../../src/validators/ticket.validator.js";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("ticket.validator", () => {
  describe("createTicketBodySchema", () => {
    const validBody = {
      title: "Printer issue",
      description: "Cannot print documents",
      priority: TicketPriority.HIGH,
      createdById: VALID_UUID,
    };

    it("accepts valid input", () => {
      const result = createTicketBodySchema.safeParse(validBody);
      expect(result.success).toBe(true);
    });

    it("trims title and description", () => {
      const result = createTicketBodySchema.parse({
        ...validBody,
        title: "  Trimmed title  ",
        description: "  Trimmed description  ",
      });

      expect(result.title).toBe("Trimmed title");
      expect(result.description).toBe("Trimmed description");
    });

    it("rejects empty title", () => {
      const result = createTicketBodySchema.safeParse({ ...validBody, title: "   " });
      expect(result.success).toBe(false);
    });

    it("rejects invalid createdById", () => {
      const result = createTicketBodySchema.safeParse({
        ...validBody,
        createdById: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid priority", () => {
      const result = createTicketBodySchema.safeParse({
        ...validBody,
        priority: "URGENT",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateTicketBodySchema", () => {
    it("accepts partial updates", () => {
      const result = updateTicketBodySchema.safeParse({ title: "Updated" });
      expect(result.success).toBe(true);
    });

    it("rejects empty body", () => {
      const result = updateTicketBodySchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects unknown fields", () => {
      const result = updateTicketBodySchema.safeParse({
        title: "Updated",
        status: TicketStatus.CLOSED,
      });
      expect(result.success).toBe(false);
    });

    it("allows null assignedToId to unassign", () => {
      const result = updateTicketBodySchema.safeParse({ assignedToId: null });
      expect(result.success).toBe(true);
    });
  });

  describe("listTicketsQuerySchema", () => {
    it("accepts search and status", () => {
      const result = listTicketsQuerySchema.parse({
        search: "login",
        status: TicketStatus.OPEN,
      });

      expect(result).toEqual({ search: "login", status: TicketStatus.OPEN });
    });

    it("transforms empty search to undefined", () => {
      const result = listTicketsQuerySchema.parse({ search: "   " });
      expect(result.search).toBeUndefined();
    });

    it("rejects invalid status filter", () => {
      const result = listTicketsQuerySchema.safeParse({ status: "DONE" });
      expect(result.success).toBe(false);
    });
  });

  describe("updateTicketStatusBodySchema", () => {
    it("accepts valid status", () => {
      const result = updateTicketStatusBodySchema.safeParse({
        status: TicketStatus.IN_PROGRESS,
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid status", () => {
      const result = updateTicketStatusBodySchema.safeParse({ status: "INVALID" });
      expect(result.success).toBe(false);
    });
  });
});

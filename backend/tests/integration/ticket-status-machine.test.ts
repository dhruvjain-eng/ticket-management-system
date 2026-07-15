import { TicketStatus } from "../setup.js";
import { createTestTicket, deleteTestTickets, getTicketStatus } from "../setup.js";
import { transitionTicket, transitionTicketRaw } from "../helpers/test-app.js";

describe("Ticket status state machine", () => {
  const createdTicketIds: string[] = [];

  afterEach(async () => {
    await deleteTestTickets(createdTicketIds);
    createdTicketIds.length = 0;
  });

  async function trackTicket(status: TicketStatus = TicketStatus.OPEN) {
    const ticket = await createTestTicket(status);
    createdTicketIds.push(ticket.id);
    return ticket;
  }

  describe("valid transitions", () => {
    it("OPEN -> IN_PROGRESS", async () => {
      const ticket = await trackTicket(TicketStatus.OPEN);

      const response = await transitionTicket(ticket.id, TicketStatus.IN_PROGRESS);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe(TicketStatus.IN_PROGRESS);
      expect(await getTicketStatus(ticket.id)).toBe(TicketStatus.IN_PROGRESS);
    });

    it("IN_PROGRESS -> RESOLVED", async () => {
      const ticket = await trackTicket(TicketStatus.IN_PROGRESS);

      const response = await transitionTicket(ticket.id, TicketStatus.RESOLVED);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe(TicketStatus.RESOLVED);
      expect(await getTicketStatus(ticket.id)).toBe(TicketStatus.RESOLVED);
    });

    it("RESOLVED -> CLOSED", async () => {
      const ticket = await trackTicket(TicketStatus.RESOLVED);

      const response = await transitionTicket(ticket.id, TicketStatus.CLOSED);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe(TicketStatus.CLOSED);
      expect(await getTicketStatus(ticket.id)).toBe(TicketStatus.CLOSED);
    });

    it("OPEN -> CANCELLED", async () => {
      const ticket = await trackTicket(TicketStatus.OPEN);

      const response = await transitionTicket(ticket.id, TicketStatus.CANCELLED);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe(TicketStatus.CANCELLED);
      expect(await getTicketStatus(ticket.id)).toBe(TicketStatus.CANCELLED);
    });

    it("IN_PROGRESS -> CANCELLED", async () => {
      const ticket = await trackTicket(TicketStatus.IN_PROGRESS);

      const response = await transitionTicket(ticket.id, TicketStatus.CANCELLED);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe(TicketStatus.CANCELLED);
      expect(await getTicketStatus(ticket.id)).toBe(TicketStatus.CANCELLED);
    });
  });

  describe("invalid transitions", () => {
    it.each([
      [TicketStatus.OPEN, TicketStatus.RESOLVED],
      [TicketStatus.OPEN, TicketStatus.CLOSED],
      [TicketStatus.IN_PROGRESS, TicketStatus.OPEN],
      [TicketStatus.RESOLVED, TicketStatus.IN_PROGRESS],
      [TicketStatus.RESOLVED, TicketStatus.CANCELLED],
      [TicketStatus.CLOSED, TicketStatus.IN_PROGRESS],
      [TicketStatus.CANCELLED, TicketStatus.OPEN],
    ] as const)("rejects %s -> %s", async (fromStatus, toStatus) => {
      const ticket = await trackTicket(fromStatus);

      const response = await transitionTicket(ticket.id, toStatus);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("INVALID_STATUS_TRANSITION");
      expect(await getTicketStatus(ticket.id)).toBe(fromStatus);
    });
  });

  describe("edge cases", () => {
    it("returns 404 when ticket does not exist", async () => {
      const response = await transitionTicket(
        "00000000-0000-4000-8000-000000000000",
        TicketStatus.IN_PROGRESS,
      );

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });

    it("returns 400 for invalid status enum", async () => {
      const ticket = await trackTicket(TicketStatus.OPEN);

      const response = await transitionTicketRaw(ticket.id, { status: "INVALID" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(await getTicketStatus(ticket.id)).toBe(TicketStatus.OPEN);
    });

    it("allows idempotent OPEN -> OPEN transition", async () => {
      const ticket = await trackTicket(TicketStatus.OPEN);

      const response = await transitionTicket(ticket.id, TicketStatus.OPEN);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe(TicketStatus.OPEN);
      expect(await getTicketStatus(ticket.id)).toBe(TicketStatus.OPEN);
    });
  });
});

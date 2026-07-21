import { TicketStatus } from "../../generated/prisma/client.js";
import {
  canTransition,
  formatAllowedTransitions,
  getAllowedTransitions,
} from "../../src/domain/ticket-status-machine.js";

describe("ticket-status-machine", () => {
  describe("getAllowedTransitions", () => {
    it("returns allowed targets for OPEN", () => {
      expect(getAllowedTransitions(TicketStatus.OPEN)).toEqual([
        TicketStatus.IN_PROGRESS,
        TicketStatus.CANCELLED,
      ]);
    });

    it("returns allowed targets for IN_PROGRESS", () => {
      expect(getAllowedTransitions(TicketStatus.IN_PROGRESS)).toEqual([
        TicketStatus.RESOLVED,
        TicketStatus.CANCELLED,
      ]);
    });

    it("returns allowed targets for RESOLVED", () => {
      expect(getAllowedTransitions(TicketStatus.RESOLVED)).toEqual([
        TicketStatus.CLOSED,
      ]);
    });

    it("returns no targets for terminal statuses", () => {
      expect(getAllowedTransitions(TicketStatus.CLOSED)).toEqual([]);
      expect(getAllowedTransitions(TicketStatus.CANCELLED)).toEqual([]);
    });
  });

  describe("canTransition", () => {
    it.each([
      [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, true],
      [TicketStatus.OPEN, TicketStatus.CANCELLED, true],
      [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, true],
      [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED, true],
      [TicketStatus.RESOLVED, TicketStatus.CLOSED, true],
    ] as const)("allows %s -> %s", (from, to, expected) => {
      expect(canTransition(from, to)).toBe(expected);
    });

    it.each([
      [TicketStatus.OPEN, TicketStatus.RESOLVED],
      [TicketStatus.OPEN, TicketStatus.CLOSED],
      [TicketStatus.IN_PROGRESS, TicketStatus.OPEN],
      [TicketStatus.RESOLVED, TicketStatus.IN_PROGRESS],
      [TicketStatus.RESOLVED, TicketStatus.CANCELLED],
      [TicketStatus.CLOSED, TicketStatus.IN_PROGRESS],
      [TicketStatus.CANCELLED, TicketStatus.OPEN],
    ] as const)("rejects %s -> %s", (from, to) => {
      expect(canTransition(from, to)).toBe(false);
    });

    it("rejects same-status transition at rule level (idempotency handled in service)", () => {
      expect(canTransition(TicketStatus.OPEN, TicketStatus.OPEN)).toBe(false);
    });
  });

  describe("formatAllowedTransitions", () => {
    it("joins allowed statuses", () => {
      expect(
        formatAllowedTransitions([TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED]),
      ).toBe("IN_PROGRESS, CANCELLED");
    });

    it('returns "none" for empty list', () => {
      expect(formatAllowedTransitions([])).toBe("none");
    });
  });
});

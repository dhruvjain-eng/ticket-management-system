import request from "supertest";
import type { Express } from "express";
import type { TicketStatus } from "./enums.js";

let app: Express | undefined;

async function getTestApp(): Promise<Express> {
  if (!app) {
    const { createApp } = await import("../../src/app.js");
    app = createApp();
  }

  return app;
}

export async function transitionTicket(ticketId: string, status: TicketStatus) {
  const application = await getTestApp();

  return request(application)
    .patch(`/api/v1/tickets/${ticketId}/status`)
    .send({ status });
}

export async function transitionTicketRaw(ticketId: string, body: unknown) {
  const application = await getTestApp();

  return request(application)
    .patch(`/api/v1/tickets/${ticketId}/status`)
    .send(body);
}

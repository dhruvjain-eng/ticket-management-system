import { execSync } from "node:child_process";
import { TicketPriority, TicketStatus, type TicketStatus as TicketStatusType } from "./helpers/enums.js";

export { TicketStatus };
export type TicketStatus = TicketStatusType;
export const TEST_USER_EMAIL = "integration-test-agent@acmesupport.com";

type PrismaClient = import("../generated/prisma/client.js").PrismaClient;

let prisma: PrismaClient;

export async function getPrisma(): Promise<PrismaClient> {
  return prisma;
}

let testUserId: string | null = null;

export async function getTestUserId(): Promise<string> {
  if (testUserId) {
    return testUserId;
  }

  const db = await getPrisma();
  const user = await db.user.upsert({
    where: { email: TEST_USER_EMAIL },
    update: {},
    create: {
      name: "Integration Test Agent",
      email: TEST_USER_EMAIL,
      role: "AGENT",
    },
    select: { id: true },
  });

  testUserId = user.id;
  return testUserId;
}

export async function createTestTicket(
  status: TicketStatusType = TicketStatus.OPEN,
): Promise<{ id: string; status: TicketStatusType }> {
  const createdById = await getTestUserId();
  const db = await getPrisma();

  return db.ticket.create({
    data: {
      title: "Integration test ticket",
      description: "Ticket created for state machine integration tests",
      priority: TicketPriority.LOW,
      status,
      createdById,
    },
    select: { id: true, status: true },
  });
}

export async function getTicketStatus(
  ticketId: string,
): Promise<TicketStatusType | null> {
  const db = await getPrisma();
  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    select: { status: true },
  });

  return ticket?.status ?? null;
}

export async function deleteTestTickets(ticketIds: string[]): Promise<void> {
  if (ticketIds.length === 0) {
    return;
  }

  const db = await getPrisma();
  await db.ticket.deleteMany({
    where: { id: { in: ticketIds } },
  });
}

beforeAll(async () => {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: process.env,
  });

  const mod = await import("../src/lib/prisma.js");
  prisma = mod.prisma;
});

afterAll(async () => {
  await prisma.$disconnect();
});

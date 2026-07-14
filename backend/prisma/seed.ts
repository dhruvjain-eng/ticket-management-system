import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  TicketPriority,
  TicketStatus,
  UserRole,
} from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.log("Clearing existing seed data…");
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding users…");
  const sarah = await prisma.user.create({
    data: {
      name: "Sarah Chen",
      email: "sarah.chen@acmesupport.com",
      role: UserRole.ADMIN,
    },
  });

  const marcus = await prisma.user.create({
    data: {
      name: "Marcus Webb",
      email: "marcus.webb@acmesupport.com",
      role: UserRole.ADMIN,
    },
  });

  const jane = await prisma.user.create({
    data: {
      name: "Jane Rivera",
      email: "jane.rivera@acmesupport.com",
      role: UserRole.AGENT,
    },
  });

  const david = await prisma.user.create({
    data: {
      name: "David Okonkwo",
      email: "david.okonkwo@acmesupport.com",
      role: UserRole.AGENT,
    },
  });

  const priya = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya.sharma@acmesupport.com",
      role: UserRole.AGENT,
    },
  });

  console.log("Seeding tickets…");
  const ticketLogin = await prisma.ticket.create({
    data: {
      title: "Unable to log in after password reset",
      description:
        "Customer reports receiving the password reset email and setting a new password, but login fails with 'Invalid credentials'. Affects user account billing@northwind.io. Issue started this morning after the maintenance window.",
      priority: TicketPriority.CRITICAL,
      status: TicketStatus.OPEN,
      createdById: sarah.id,
      assignedToId: jane.id,
    },
  });

  const ticketInvoice = await prisma.ticket.create({
    data: {
      title: "Invoice PDF missing line items",
      description:
        "Generated invoice #INV-20481 is missing the subscription line item and tax breakdown. Customer needs a corrected PDF before their accounting deadline on Friday.",
      priority: TicketPriority.HIGH,
      status: TicketStatus.IN_PROGRESS,
      createdById: marcus.id,
      assignedToId: david.id,
    },
  });

  const ticketMobileCrash = await prisma.ticket.create({
    data: {
      title: "Mobile app crashes on startup",
      description:
        "iOS app version 3.2.1 crashes immediately on launch for multiple users on iOS 18. Android users are unaffected. Crash logs point to a null reference in the session bootstrap module.",
      priority: TicketPriority.HIGH,
      status: TicketStatus.IN_PROGRESS,
      createdById: jane.id,
      assignedToId: priya.id,
    },
  });

  const ticketCsvExport = await prisma.ticket.create({
    data: {
      title: "Request: export tickets to CSV",
      description:
        "Customer success team is requesting a CSV export of all closed tickets from the last quarter for a quarterly business review. No export option is visible in the current UI.",
      priority: TicketPriority.LOW,
      status: TicketStatus.OPEN,
      createdById: marcus.id,
      assignedToId: null,
    },
  });

  const ticketEmailDelay = await prisma.ticket.create({
    data: {
      title: "Email notifications delayed by 2 hours",
      description:
        "Ticket assignment and status-change emails are arriving approximately two hours late. Mail queue monitoring shows a backlog starting at 09:15 UTC.",
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.RESOLVED,
      createdById: david.id,
      assignedToId: jane.id,
    },
  });

  const ticketDashboard = await prisma.ticket.create({
    data: {
      title: "Dashboard shows incorrect ticket count",
      description:
        "The support dashboard open-ticket counter displays 42 but the ticket list filtered to Open shows 38. Discrepancy appears after applying the status filter and refreshing the page.",
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.RESOLVED,
      createdById: priya.id,
      assignedToId: marcus.id,
    },
  });

  const ticketDuplicateCharges = await prisma.ticket.create({
    data: {
      title: "Duplicate charges on subscription renewal",
      description:
        "Customer was charged twice for the annual renewal on April 1. Payment IDs pay_91a2 and pay_91a3 both appear in Stripe for the same subscription sub_4481.",
      priority: TicketPriority.CRITICAL,
      status: TicketStatus.CLOSED,
      createdById: sarah.id,
      assignedToId: david.id,
    },
  });

  const ticketMfa = await prisma.ticket.create({
    data: {
      title: "How to reset MFA device?",
      description:
        "User lost access to their authenticator app after a phone replacement. They need steps to reset MFA and regain access without compromising account security.",
      priority: TicketPriority.LOW,
      status: TicketStatus.CLOSED,
      createdById: jane.id,
      assignedToId: null,
    },
  });

  const ticketSso = await prisma.ticket.create({
    data: {
      title: "SSO integration failing for Okta users",
      description:
        "Users authenticating via Okta receive a 403 after redirect. SAML response validation errors appeared in logs after the IdP certificate rotation on Monday.",
      priority: TicketPriority.HIGH,
      status: TicketStatus.CANCELLED,
      createdById: marcus.id,
      assignedToId: null,
    },
  });

  const ticketSearch = await prisma.ticket.create({
    data: {
      title: "Search returns no results for known tickets",
      description:
        "Searching for the keyword 'billing' returns zero results even though several open tickets contain the word in the title or description. Status filter set to All Statuses.",
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
      createdById: priya.id,
      assignedToId: null,
    },
  });

  console.log("Seeding comments…");
  await prisma.comment.createMany({
    data: [
      {
        ticketId: ticketLogin.id,
        createdById: jane.id,
        message:
          "Reproduced in staging with the customer's email. Password hash is updating but the session cookie domain looks misconfigured.",
      },
      {
        ticketId: ticketLogin.id,
        createdById: sarah.id,
        message:
          "Escalating to platform — please capture HAR file from the customer if the next deploy does not fix it.",
      },
      {
        ticketId: ticketInvoice.id,
        createdById: david.id,
        message:
          "Found a template regression in the PDF renderer. Working on a patch to include nested line items.",
      },
      {
        ticketId: ticketInvoice.id,
        createdById: marcus.id,
        message: "Customer confirmed they can wait until Thursday EOD for the corrected invoice.",
      },
      {
        ticketId: ticketMobileCrash.id,
        createdById: priya.id,
        message:
          "Crash tied to optional profile field when legacy sessions lack a display name. Hotfix branch created.",
      },
      {
        ticketId: ticketMobileCrash.id,
        createdById: jane.id,
        message: "QA is validating the hotfix on iOS 18.1 and 18.2 simulators.",
      },
      {
        ticketId: ticketCsvExport.id,
        createdById: marcus.id,
        message:
          "Logged as a feature request for Core MVP follow-up. Suggested workaround: admin API export script.",
      },
      {
        ticketId: ticketEmailDelay.id,
        createdById: jane.id,
        message:
          "Cleared stuck messages from the notification queue. Monitoring for recurrence.",
      },
      {
        ticketId: ticketEmailDelay.id,
        createdById: david.id,
        message:
          "Confirmed with customer that notifications are arriving within one minute again. Closing as resolved.",
      },
      {
        ticketId: ticketDashboard.id,
        createdById: marcus.id,
        message:
          "Counter cache was stale after filter changes. Patch merged to refresh counts on each list fetch.",
      },
      {
        ticketId: ticketDuplicateCharges.id,
        createdById: david.id,
        message:
          "Issued refund for duplicate charge pay_91a3 and added idempotency key to renewal webhook handler.",
      },
      {
        ticketId: ticketDuplicateCharges.id,
        createdById: sarah.id,
        message:
          "Customer confirmed refund received. Ticket closed — finance notified for reconciliation.",
      },
      {
        ticketId: ticketMfa.id,
        createdById: jane.id,
        message:
          "Sent secure MFA reset link via verified email. User confirmed access restored.",
      },
      {
        ticketId: ticketSso.id,
        createdById: marcus.id,
        message:
          "Customer moved to manual auth while they rotate certificates on their side. Cancelling until they reopen.",
      },
      {
        ticketId: ticketSearch.id,
        createdById: priya.id,
        message:
          "Investigating backend search query — ILIKE filter may not be applied when the search param is empty string vs absent.",
      },
    ],
  });

  console.log("Seed complete: 5 users, 10 tickets, 15 comments.");
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

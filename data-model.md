# Data Model

**Database:** PostgreSQL  
**ORM:** Prisma 7  
**Schema file:** `backend/prisma/schema.prisma`  
**Migration:** `backend/prisma/migrations/20260714060235_init/`  
**Seed:** `backend/prisma/seed.ts`

---

## Entity-Relationship Overview

```
┌──────────┐       creates        ┌──────────┐
│   User   │─────────────────────►│  Ticket  │
│          │◄────assigned (opt)───│          │
└────┬─────┘                      └────┬─────┘
     │                                 │
     │ writes                          │ has many
     ▼                                 ▼
┌──────────┐                      ┌──────────┐
│ Comment  │◄─────────────────────│  Ticket  │
└──────────┘                      └──────────┘
```

---

## Enums

### `UserRole`
| Value | Description |
|-------|-------------|
| `AGENT` | Support agent |
| `ADMIN` | Administrator |

### `TicketPriority`
`LOW` · `MEDIUM` · `HIGH` · `CRITICAL`

### `TicketStatus`
`OPEN` · `IN_PROGRESS` · `RESOLVED` · `CLOSED` · `CANCELLED`

---

## User

**Table:** `users`  
**Purpose:** Seeded operators only (no user-management UI in Core)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, default `uuid()` |
| `name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `role` | `UserRole` | NOT NULL |
| `created_at` | TIMESTAMP | DEFAULT now |
| `updated_at` | TIMESTAMP | AUTO UPDATE |

**Relations:**
- `createdTickets` — tickets created by this user
- `assignedTickets` — tickets assigned to this user
- `comments` — comments authored by this user

---

## Ticket

**Table:** `tickets`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `title` | VARCHAR(200) | NOT NULL |
| `description` | TEXT | NOT NULL |
| `priority` | `TicketPriority` | NOT NULL |
| `status` | `TicketStatus` | NOT NULL, default `OPEN` |
| `assigned_to_id` | UUID | FK → `users.id`, NULLABLE |
| `created_by_id` | UUID | FK → `users.id`, NOT NULL |
| `created_at` | TIMESTAMP | DEFAULT now |
| `updated_at` | TIMESTAMP | AUTO UPDATE |

**Indexes:**
- `tickets_status_idx` — filter by status
- `tickets_assigned_to_id_idx` — assignee lookups
- `tickets_created_by_id_idx` — creator lookups
- `tickets_created_at_idx` — list ordering (desc)

**Relations:**
- `assignedTo` → `User` (`onDelete: SetNull`)
- `createdBy` → `User` (`onDelete: Restrict`)
- `comments` → `Comment[]`

---

## Comment

**Table:** `comments`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `ticket_id` | UUID | FK → `tickets.id`, NOT NULL |
| `message` | TEXT | NOT NULL |
| `created_by_id` | UUID | FK → `users.id`, NOT NULL |
| `created_at` | TIMESTAMP | DEFAULT now |

**Indexes:**
- `comments_ticket_id_idx`
- `comments_ticket_id_created_at_idx` — chronological comment order

**Relations:**
- `ticket` → `Ticket` (`onDelete: Cascade`)
- `createdBy` → `User` (`onDelete: Restrict`)

---

## Seed Data Summary

| Entity | Count | Notes |
|--------|-------|-------|
| Users | 5 | Mix of `AGENT` and `ADMIN` |
| Tickets | 10 | Various priorities and statuses; some unassigned |
| Comments | 15 | Distributed across tickets |

Run: `cd backend && npm run db:seed`  
Re-seed clears existing rows in these tables before insert.

---

## State Machine (data layer)

Status is stored on `tickets.status`. Transitions are enforced in `status-transition.service.ts`, not by database triggers.

| Current status | Allowed next values |
|----------------|---------------------|
| `OPEN` | `IN_PROGRESS`, `CANCELLED` |
| `IN_PROGRESS` | `RESOLVED`, `CANCELLED` |
| `RESOLVED` | `CLOSED` |
| `CLOSED` | *(none — terminal)* |
| `CANCELLED` | *(none — terminal)* |

---

## Environment

Set `DATABASE_URL` in `backend/.env` (see `backend/.env.example`).  
Do not commit real connection strings.

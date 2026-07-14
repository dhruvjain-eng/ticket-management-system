# Technical Specification: Support Ticket Management System

**Version:** 1.0
**Scope:** Core (mandatory) only — no Stretch features
**Stack:** Next.js · Express · PostgreSQL · Prisma · TypeScript

---

## Document Control

| Item | Value |
|------|-------|
| Project | Support Ticket Management System |
| Frontend | Next.js 14+ (App Router), TypeScript, React |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 15+ |
| ORM | Prisma |
| Auth | None (Core) |
| API style | REST, JSON |
| Base API path | `/api/v1` |

---

## 1. Overall Architecture

### 1.1 High-Level Overview

The system is a **three-tier, decoupled full-stack application**. The Next.js frontend and Express backend run as separate processes in development. PostgreSQL is the single source of truth for all persisted data.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Next.js Frontend  (port 3000)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ App Router   │  │ Components   │  │ API Client Layer     │  │
│  │ (pages)      │  │ (forms, list)│  │ (fetch wrapper)      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST over HTTP
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Express Backend  (port 3001)                         │
│  ┌──────────┐  ┌────────────┐  ┌───────────┐  ┌─────────────┐  │
│  │ Routes   │→ │ Controllers│→ │ Services  │→ │ Prisma ORM  │  │
│  └──────────┘  └────────────┘  └───────────┘  └──────┬──────┘  │
│         ▲                          ▲                  │         │
│         │                          │                  │         │
│  ┌──────┴──────┐            ┌──────┴──────┐          │         │
│  │ Middleware  │            │ Validators  │          │         │
│  │ (errors,CORS)│            │ (Zod)       │          │         │
│  └─────────────┘            └─────────────┘          │         │
└──────────────────────────────────────────────────────┼─────────┘
                                                       │ SQL
                                                       ▼
                                            ┌──────────────────┐
                                            │   PostgreSQL     │
                                            └──────────────────┘
```

### 1.2 Architectural Principles

| Principle | Application |
|-----------|-------------|
| Separation of concerns | Routes handle HTTP; controllers orchestrate; services hold business logic; Prisma handles persistence |
| Backend authority | State machine rules, validation, and data integrity enforced server-side |
| Thin frontend | UI renders data and calls APIs; no business-rule duplication beyond UX hints |
| Stateless API | No sessions or auth in Core; `createdBy` supplied explicitly per request |
| Fail fast | Invalid input rejected before DB writes; errors returned in a consistent shape |

### 1.3 Process & Port Configuration

| Service | Default Port | Environment Variable |
|---------|--------------|----------------------|
| Next.js frontend | `3000` | — |
| Express backend | `3001` | `PORT` |
| PostgreSQL | `5432` | via `DATABASE_URL` |

### 1.4 Cross-Origin Configuration

Express enables CORS for `http://localhost:3000` in development. Production CORS origins are configured via `CORS_ORIGIN`.

### 1.5 Monorepo Layout

The repository uses a **root-level monorepo** with two application packages and one shared types package:

```
ticket-management-system/
├── backend/          # Express API + Prisma
├── frontend/         # Next.js app
├── packages/
│   └── shared/       # Shared enums, types, state-machine constants
├── package.json      # Optional workspace root (npm/pnpm workspaces)
└── ...
```

The `packages/shared` package exports TypeScript enums and the allowed status-transition map so frontend and backend stay aligned without duplicating business rules in UI logic (UI uses shared map for button enablement only; backend remains authoritative).

### 1.6 Data Flow Examples

**Create ticket**
1. User submits form on `/tickets/new`
2. Frontend validates client-side (optional UX), POSTs to `POST /api/v1/tickets`
3. Express validates with Zod, verifies `createdBy` and `assignedTo` FKs
4. Prisma creates ticket with `status = OPEN`, timestamps set
5. Response returned; frontend redirects to detail or list

**Status transition**
1. User selects next status on ticket detail page
2. Frontend PATCHes `PATCH /api/v1/tickets/:id/status`
3. `TicketStatusService` validates transition against state machine
4. On success, Prisma updates `status` and `updatedAt` atomically
5. On failure, `400` with `INVALID_STATUS_TRANSITION` returned

### 1.7 Technology Choices

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend framework | Next.js App Router | Modern React SSR/CSR, file-based routing, TypeScript-first |
| Styling | CSS Modules or Tailwind CSS | Implementation choice; keep consistent within project |
| HTTP server | Express 4.x | Lightweight, well-understood, good test tooling |
| ORM | Prisma | Type-safe queries, migrations, seed support for PostgreSQL |
| Validation | Zod | Runtime validation with TypeScript inference |
| Testing | Vitest + Supertest (backend) | Fast integration tests against Express app |
| HTTP client (frontend) | Native `fetch` wrapped in typed client | No extra dependency required |

### 1.8 Out of Scope

Authentication, user CRUD, pagination, priority/assignee filters, sorting, Docker, CI, Swagger, and unit test tiers beyond state-machine integration tests.

---

## 2. Database Schema

### 2.1 Entity-Relationship Diagram

```
┌──────────────┐         ┌──────────────────────────────┐
│    User      │         │           Ticket             │
├──────────────┤         ├──────────────────────────────┤
│ id (PK)      │──┐   ┌──│ id (PK)                      │
│ name         │  │   │  │ title                        │
│ email (UQ)   │  │   │  │ description                  │
│ role         │  │   │  │ priority (enum)              │
│ createdAt    │  │   │  │ status (enum)                │
│ updatedAt    │  │   ├──│ assignedToId (FK, nullable)  │
└──────────────┘  │   │  │ createdById (FK)             │
       │          │   │  │ createdAt                    │
       │          │   │  │ updatedAt                    │
       │          │   │  └──────────────────────────────┘
       │          │   │              │
       │          └───┘              │ 1
       │          createdBy           │
       │          assignedTo          │ *
       │                              ▼
       │          ┌──────────────────────────────┐
       └──────────│           Comment            │
         createdBy  ├──────────────────────────────┤
                  │ id (PK)                      │
                  │ ticketId (FK)                │
                  │ message                      │
                  │ createdById (FK)             │
                  │ createdAt                    │
                  └──────────────────────────────┘
```

### 2.2 Prisma Model Definitions (Conceptual)

#### Enum: `UserRole`
| Value | Description |
|-------|-------------|
| `AGENT` | Support agent (informational in Core) |
| `ADMIN` | Administrator (informational in Core) |

#### Enum: `TicketPriority`
| Value | Sort Order |
|-------|------------|
| `LOW` | 1 |
| `MEDIUM` | 2 |
| `HIGH` | 3 |
| `CRITICAL` | 4 |

#### Enum: `TicketStatus`
| Value | Terminal? |
|-------|-----------|
| `OPEN` | No |
| `IN_PROGRESS` | No |
| `RESOLVED` | No |
| `CLOSED` | Yes |
| `CANCELLED` | Yes |

> **API/UI display mapping:** Prisma stores `IN_PROGRESS`; API responses expose `"In Progress"` (human-readable) or consistent snake_case — **pick one convention and apply everywhere**. Recommended: store `IN_PROGRESS` in DB; serialize as `"In Progress"` in API JSON for readability.

#### Table: `users`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `UUID` | PK, default `gen_random_uuid()` |
| `name` | `VARCHAR(100)` | NOT NULL |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE |
| `role` | `UserRole` | NOT NULL |
| `createdAt` | `TIMESTAMPTZ` | NOT NULL, default `now()` |
| `updatedAt` | `TIMESTAMPTZ` | NOT NULL, auto-updated |

#### Table: `tickets`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `UUID` | PK, default `gen_random_uuid()` |
| `title` | `VARCHAR(200)` | NOT NULL |
| `description` | `TEXT` | NOT NULL |
| `priority` | `TicketPriority` | NOT NULL |
| `status` | `TicketStatus` | NOT NULL, default `OPEN` |
| `assignedToId` | `UUID` | FK → `users.id`, ON DELETE SET NULL, nullable |
| `createdById` | `UUID` | FK → `users.id`, ON DELETE RESTRICT, NOT NULL |
| `createdAt` | `TIMESTAMPTZ` | NOT NULL, default `now()` |
| `updatedAt` | `TIMESTAMPTZ` | NOT NULL, auto-updated |

**Indexes:**
- `tickets_status_idx` on (`status`)
- `tickets_assigned_to_id_idx` on (`assignedToId`)
- `tickets_created_by_id_idx` on (`createdById`)
- `tickets_created_at_idx` on (`createdAt` DESC)
- `tickets_title_description_search_idx` — GIN full-text index on `to_tsvector('english', title || ' ' || description)` **or** rely on `ILIKE` for Core simplicity

#### Table: `comments`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `UUID` | PK, default `gen_random_uuid()` |
| `ticketId` | `UUID` | FK → `tickets.id`, ON DELETE CASCADE, NOT NULL |
| `message` | `TEXT` | NOT NULL |
| `createdById` | `UUID` | FK → `users.id`, ON DELETE RESTRICT, NOT NULL |
| `createdAt` | `TIMESTAMPTZ` | NOT NULL, default `now()` |

**Indexes:**
- `comments_ticket_id_idx` on (`ticketId`)
- `comments_ticket_id_created_at_idx` on (`ticketId`, `createdAt` ASC)

### 2.3 Referential Integrity Rules

| Relationship | On Delete Behavior | Rationale |
|--------------|-------------------|-----------|
| Ticket → User (`createdBy`) | RESTRICT | Prevent deleting users referenced as creators |
| Ticket → User (`assignedTo`) | SET NULL | Ticket survives if assignee seed row removed |
| Comment → Ticket | CASCADE | Comments deleted with ticket |
| Comment → User (`createdBy`) | RESTRICT | Preserve comment authorship integrity |

### 2.4 Migrations & Seeding

| Artifact | Location | Purpose |
|----------|----------|---------|
| Prisma schema | `backend/prisma/schema.prisma` | Source of truth for models |
| Migrations | `backend/prisma/migrations/` | Generated via `prisma migrate dev` |
| Seed script | `backend/prisma/seed.ts` | Populates users and optional sample tickets/comments |

**Seed data requirements (minimum):**
- 4–5 users with mixed roles (`AGENT`, `ADMIN`)
- Optional: 3–5 sample tickets in varied statuses
- Optional: 2–3 comments on sample tickets

**Commands (documented in README):**
- `npx prisma migrate dev` — apply migrations
- `npx prisma db seed` — run seed
- `npx prisma migrate reset` — reset DB (dev/test only)

### 2.5 Test Database Strategy

- Separate database: `ticket_management_test` (via `DATABASE_URL` in test env)
- Integration tests run `prisma migrate deploy` + seed before suite (or per-file setup)
- Each test file uses unique ticket data or cleans up created records in `afterEach`
- State machine tests create tickets programmatically; they do not depend on optional seed tickets

---

## 3. API Contracts

**Base URL:** `http://localhost:3001/api/v1`
**Content-Type:** `application/json`
**Date format:** ISO 8601 (`2026-07-14T09:30:00.000Z`)

### 3.1 Common Response Envelope

#### Success (single resource)
```json
{
  "data": { }
}
```

#### Success (collection)
```json
{
  "data": [ ],
  "meta": {
    "count": 12
  }
}
```

#### Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "details": [
      { "field": "title", "message": "Title is required" }
    ]
  }
}
```

### 3.2 Error Codes

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Zod / field validation failure |
| 400 | `INVALID_STATUS_TRANSITION` | State machine rejection |
| 400 | `INVALID_REFERENCE` | FK references non-existent user/ticket |
| 404 | `NOT_FOUND` | Resource does not exist |
| 500 | `INTERNAL_ERROR` | Unhandled server error |

### 3.3 Shared Object Shapes

#### UserSummary
| Field | Type | Notes |
|-------|------|-------|
| `id` | string (UUID) | |
| `name` | string | |
| `email` | string | |
| `role` | string | `AGENT` \| `ADMIN` |

#### UserRef (embedded in tickets/comments)
| Field | Type |
|-------|------|
| `id` | string |
| `name` | string |

#### TicketListItem
| Field | Type |
|-------|------|
| `id` | string |
| `title` | string |
| `priority` | string |
| `status` | string |
| `assignedTo` | UserRef \| null |
| `createdBy` | UserRef |
| `createdAt` | string (ISO) |
| `updatedAt` | string (ISO) |

#### TicketDetail (extends list fields)
| Field | Type |
|-------|------|
| `description` | string |
| `comments` | Comment[] |

#### Comment
| Field | Type |
|-------|------|
| `id` | string |
| `message` | string |
| `createdBy` | UserRef |
| `createdAt` | string (ISO) |

---

### 3.4 Endpoints

#### `GET /users`

List all seeded users (read-only).

**Response `200`**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Jane Agent",
      "email": "jane@example.com",
      "role": "AGENT"
    }
  ],
  "meta": { "count": 4 }
}
```

---

#### `GET /users/:id`

Get a single user.

**Response `200`** — `{ "data": UserSummary }`
**Response `404`** — user not found

---

#### `GET /tickets`

List tickets with optional search and status filter.

**Query parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `search` | string | No | Case-insensitive keyword; matches `title` OR `description` |
| `status` | string | No | Exact status filter; must be valid `TicketStatus` value |

**Behavior**
- No params → return all tickets, ordered by `createdAt` DESC
- `search` only → filter by keyword
- `status` only → filter by status
- Both → apply AND logic
- Empty `search` string treated as absent

**Response `200`**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Login page broken",
      "priority": "HIGH",
      "status": "OPEN",
      "assignedTo": { "id": "uuid", "name": "Jane Agent" },
      "createdBy": { "id": "uuid", "name": "Bob Admin" },
      "createdAt": "2026-07-14T09:30:00.000Z",
      "updatedAt": "2026-07-14T09:30:00.000Z"
    }
  ],
  "meta": { "count": 1 }
}
```

**Response `400`** — invalid `status` enum value

---

#### `POST /tickets`

Create a new ticket.

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `title` | string | Yes |
| `description` | string | Yes |
| `priority` | string | Yes |
| `createdById` | string (UUID) | Yes |
| `assignedToId` | string (UUID) | No |

**Server behavior**
- Sets `status` to `OPEN` (not accepted from client)
- Sets `createdAt`, `updatedAt` to current time
- Validates `createdById` and `assignedToId` (if provided) exist

**Response `201`**
```json
{
  "data": { /* TicketDetail without comments or with empty comments [] */ }
}
```

**Response `400`** — validation or FK failure

---

#### `GET /tickets/:id`

Get ticket detail including comments.

**Response `200`**
```json
{
  "data": {
    "id": "uuid",
    "title": "Login page broken",
    "description": "Users cannot log in after latest deploy.",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "assignedTo": { "id": "uuid", "name": "Jane Agent" },
    "createdBy": { "id": "uuid", "name": "Bob Admin" },
    "createdAt": "2026-07-14T09:30:00.000Z",
    "updatedAt": "2026-07-14T10:00:00.000Z",
    "comments": [
      {
        "id": "uuid",
        "message": "Investigating logs now.",
        "createdBy": { "id": "uuid", "name": "Jane Agent" },
        "createdAt": "2026-07-14T10:00:00.000Z"
      }
    ]
  }
}
```

**Response `404`** — ticket not found

---

#### `PATCH /tickets/:id`

Update ticket fields. **Status is not accepted on this endpoint.**

**Request body** (at least one field required)

| Field | Type | Required |
|-------|------|----------|
| `title` | string | No |
| `description` | string | No |
| `priority` | string | No |
| `assignedToId` | string \| null | No |

**Server behavior**
- Rejects body containing `status` field with `400 VALIDATION_ERROR`
- Updates `updatedAt` on success
- `assignedToId: null` unassigns ticket

**Response `200`** — `{ "data": TicketDetail }`
**Response `400`** — validation failure
**Response `404`** — ticket not found

---

#### `PATCH /tickets/:id/status`

Transition ticket status via state machine.

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `status` | string | Yes |

**Response `200`**
```json
{
  "data": {
    "id": "uuid",
    "status": "IN_PROGRESS",
    "updatedAt": "2026-07-14T10:00:00.000Z"
  }
}
```

> May return full `TicketDetail` instead of partial — either is acceptable; pick one and stay consistent.

**Response `400`**
```json
{
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Cannot transition from 'CLOSED' to 'IN_PROGRESS'",
    "details": [
      {
        "field": "status",
        "message": "Allowed transitions from CLOSED: none"
      }
    ]
  }
}
```

**Response `404`** — ticket not found

---

#### `POST /tickets/:id/comments`

Add a comment to a ticket.

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `message` | string | Yes |
| `createdById` | string (UUID) | Yes |

**Response `201`**
```json
{
  "data": {
    "id": "uuid",
    "message": "Fixed in commit abc123.",
    "createdBy": { "id": "uuid", "name": "Jane Agent" },
    "createdAt": "2026-07-14T11:00:00.000Z"
  }
}
```

**Response `400`** — validation failure
**Response `404`** — ticket not found

---

#### `GET /health`

Optional health check for README smoke test.

**Response `200`**
```json
{ "status": "ok" }
```

---

## 4. Validation Rules

Validation occurs in **two layers**: frontend (UX) and backend (authoritative). All rules below are enforced on the backend via Zod schemas in `backend/src/validators/`.

### 4.1 User References

| Rule | Error |
|------|-------|
| `createdById` must be valid UUID format | `VALIDATION_ERROR` |
| `createdById` must reference existing user | `INVALID_REFERENCE` |
| `assignedToId` (if provided) must be valid UUID | `VALIDATION_ERROR` |
| `assignedToId` (if provided) must reference existing user | `INVALID_REFERENCE` |
| `assignedToId: null` is valid (unassign) | — |

### 4.2 Ticket — Create

| Field | Rules |
|-------|-------|
| `title` | Required; trim whitespace; min length 1; max length 200 |
| `description` | Required; trim whitespace; min length 1; max length 10,000 |
| `priority` | Required; must be one of `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `createdById` | Required; valid UUID; user must exist |
| `assignedToId` | Optional; valid UUID; user must exist if provided |
| `status` | Ignored if sent; always set to `OPEN` server-side |

### 4.3 Ticket — Update (PATCH /tickets/:id)

| Field | Rules |
|-------|-------|
| Body | At least one updatable field required |
| `title` | If present: trim; min 1; max 200 |
| `description` | If present: trim; min 1; max 10,000 |
| `priority` | If present: valid enum |
| `assignedToId` | If present: valid UUID or explicit `null` |
| `status` | **Rejected** if present in body |

### 4.4 Ticket — Status Transition

| Field | Rules |
|-------|-------|
| `status` | Required; valid `TicketStatus` enum |
| Transition | Current ticket status → requested status must be in allowed transition map |
| Terminal states | `CLOSED`, `CANCELLED` — no outgoing transitions |

### 4.5 Comment — Create

| Field | Rules |
|-------|-------|
| `message` | Required; trim; min length 1; max length 5,000 |
| `createdById` | Required; valid UUID; user must exist |
| `ticketId` (path) | Valid UUID; ticket must exist |

### 4.6 Query Parameters — GET /tickets

| Param | Rules |
|-------|-------|
| `search` | Optional; if present, max length 200; trim |
| `status` | Optional; if present, must be valid `TicketStatus` enum |

### 4.7 Path Parameters

| Param | Rules |
|-------|-------|
| `:id` | Must be valid UUID format; return `404` if resource not found |

### 4.8 Frontend Validation (UX Layer)

Frontend mirrors backend rules for immediate feedback but does not replace server validation:

- Required field indicators on forms
- Max length hints on text inputs
- Disable submit until required fields filled
- Display server-returned `details[]` field errors inline

---

## 5. Folder Structure

```
ticket-management-system/
├── README.md
├── .gitignore
├── .env.example
├── package.json                         # Workspace root (optional)
│
├── tool-specific/
│   └── cursor-workflow/
│       ├── project-context.md
│       ├── spec.md                      # This document
│       ├── tasks.md
│       ├── acceptance-criteria.md
│       └── cursor-rules-or-instructions.md
│
├── prompt-history/
│
├── packages/
│   └── shared/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── enums.ts                 # TicketStatus, TicketPriority, UserRole
│           ├── status-machine.ts        # ALLOWED_TRANSITIONS map, helpers
│           └── types.ts                 # Shared DTO type definitions
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── src/
│   │   ├── index.ts                     # Server entry point
│   │   ├── app.ts                       # Express app factory (exported for tests)
│   │   ├── config/
│   │   │   └── env.ts                   # Validated environment variables
│   │   ├── routes/
│   │   │   ├── index.ts                 # Mounts /api/v1 routes
│   │   │   ├── user.routes.ts
│   │   │   ├── ticket.routes.ts
│   │   │   └── health.routes.ts
│   │   ├── controllers/
│   │   │   ├── user.controller.ts
│   │   │   └── ticket.controller.ts
│   │   ├── services/
│   │   │   ├── user.service.ts
│   │   │   ├── ticket.service.ts
│   │   │   ├── comment.service.ts
│   │   │   └── ticket-status.service.ts   # State machine logic
│   │   ├── validators/
│   │   │   ├── ticket.validator.ts
│   │   │   ├── comment.validator.ts
│   │   │   └── common.validator.ts          # UUID param schema
│   │   ├── middleware/
│   │   │   ├── error-handler.ts
│   │   │   ├── not-found.ts
│   │   │   └── validate.ts                  # Zod validation wrapper
│   │   ├── lib/
│   │   │   └── prisma.ts                    # Prisma client singleton
│   │   └── types/
│   │       └── express.d.ts
│   └── tests/
│       ├── setup.ts
│       └── integration/
│           ├── ticket-status-machine.test.ts
│           └── helpers/
│               ├── test-app.ts
│               └── db.ts
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── .env.local.example
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx                     # Redirect to /tickets
        │   ├── globals.css
        │   └── tickets/
        │       ├── page.tsx                 # Ticket list
        │       ├── new/
        │       │   └── page.tsx             # Create ticket
        │       └── [id]/
        │           └── page.tsx             # Ticket detail + edit
        ├── components/
        │   ├── layout/
        │   │   ├── Header.tsx
        │   │   └── ErrorBanner.tsx
        │   ├── tickets/
        │   │   ├── TicketList.tsx
        │   │   ├── TicketListItem.tsx
        │   │   ├── TicketFilters.tsx
        │   │   ├── TicketForm.tsx
        │   │   ├── TicketDetail.tsx
        │   │   ├── TicketFieldEditor.tsx
        │   │   ├── StatusTransitionControl.tsx
        │   │   ├── CommentList.tsx
        │   │   └── CommentForm.tsx
        │   └── ui/
        │       ├── Button.tsx
        │       ├── Input.tsx
        │       ├── Select.tsx
        │       ├── Textarea.tsx
        │       ├── Badge.tsx
        │       └── LoadingSpinner.tsx
        ├── lib/
        │   ├── api-client.ts                # Typed fetch wrapper
        │   ├── api/
        │   │   ├── users.ts
        │   │   └── tickets.ts
        │   └── errors.ts                    # Parse API error responses
        └── types/
            └── index.ts                     # Re-exports from @shared or local types
```

### 5.1 Module Responsibilities

| Module | Responsibility |
|--------|----------------|
| `packages/shared` | Enums, transition map, shared types — no runtime dependencies |
| `backend/src/services/ticket-status.service.ts` | Sole owner of transition validation logic |
| `backend/src/app.ts` | Express app without `listen()` — enables Supertest |
| `frontend/src/lib/api-client.ts` | Base URL, error parsing, typed HTTP methods |
| `frontend/src/components/tickets/StatusTransitionControl.tsx` | Renders only valid next statuses (UX); calls status API |

---

## 6. State Machine Design

### 6.1 Transition Map

The allowed transitions are defined as a constant map in `packages/shared/src/status-machine.ts` and imported by both backend service and frontend UI.

| Current Status | Allowed Next Statuses |
|----------------|----------------------|
| `OPEN` | `IN_PROGRESS`, `CANCELLED` |
| `IN_PROGRESS` | `RESOLVED`, `CANCELLED` |
| `RESOLVED` | `CLOSED` |
| `CLOSED` | *(none — terminal)* |
| `CANCELLED` | *(none — terminal)* |

### 6.2 State Diagram

```
                    ┌─────────────┐
                    │    OPEN     │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               │               ▼
   ┌───────────────┐       │       ┌─────────────┐
   │ IN_PROGRESS   │       │       │ CANCELLED   │ (terminal)
   └───────┬───────┘       │       └─────────────┘
           │               │
     ┌─────┴─────┐         │
     ▼           ▼         │
┌─────────┐  ┌─────────┐   │
│RESOLVED │  │CANCELLED│◄──┘ (also from IN_PROGRESS)
└────┬────┘  └─────────┘
     │         (terminal)
     ▼
┌─────────┐
│ CLOSED  │ (terminal)
└─────────┘
```

### 6.3 Backend Implementation Design

**Location:** `backend/src/services/ticket-status.service.ts`

**Public interface:**

| Method | Input | Output |
|--------|-------|--------|
| `getAllowedTransitions(currentStatus)` | `TicketStatus` | `TicketStatus[]` |
| `canTransition(from, to)` | two `TicketStatus` values | `boolean` |
| `transitionTicket(ticketId, newStatus)` | UUID, `TicketStatus` | Updated ticket or throws `AppError` |

**`transitionTicket` algorithm:**
1. Fetch ticket by ID; throw `NOT_FOUND` if missing
2. If `ticket.status === newStatus`, return ticket unchanged (idempotent) **or** reject as no-op — **recommend: allow idempotent success**
3. Call `canTransition(current, new)`; if false, throw `INVALID_STATUS_TRANSITION` with message listing allowed targets
4. Prisma `update` in single query: set `status`, `updatedAt`
5. Return updated ticket

**Concurrency:** Core scope does not require optimistic locking. Last write wins on status is acceptable for the assessment.

### 6.4 Frontend Implementation Design

**Location:** `frontend/src/components/tickets/StatusTransitionControl.tsx`

- On mount, read current ticket status
- Import `getAllowedTransitions` from `@shared/status-machine`
- Render a button or dropdown **only** for allowed next statuses
- On selection, call `PATCH /tickets/:id/status`
- On `400 INVALID_STATUS_TRANSITION`, display `error.message` in `ErrorBanner`
- Terminal states: show status badge with no action controls

### 6.5 Invalid Transition Examples

| From | To | Result |
|------|-----|--------|
| `OPEN` | `RESOLVED` | Rejected |
| `OPEN` | `CLOSED` | Rejected |
| `IN_PROGRESS` | `OPEN` | Rejected |
| `RESOLVED` | `IN_PROGRESS` | Rejected |
| `RESOLVED` | `CANCELLED` | Rejected |
| `CLOSED` | any | Rejected |
| `CANCELLED` | any | Rejected |

---

## 7. UI Page Descriptions

### 7.1 Global Layout

**Route:** wraps all pages via `app/layout.tsx`

**Elements:**
- App header with title: "Support Ticket Management"
- Navigation link: "All Tickets"
- Primary action button: "New Ticket" → `/tickets/new`
- Main content area
- Global error boundary for unexpected render errors

**States:** N/A (static shell)

---

### 7.2 Ticket List Page

**Route:** `/tickets` (`app/tickets/page.tsx`)

**Purpose:** View, search, and filter all tickets.

**Sections:**

| Section | Description |
|---------|-------------|
| Page header | Title "Tickets" + "New Ticket" button |
| Filters bar | Keyword search input (debounced 300ms); status dropdown with "All Statuses" + each status |
| Ticket table/list | Columns: Title (link), Priority (badge), Status (badge), Assignee, Created By, Created Date |
| Empty state | "No tickets found" when list is empty or filters match nothing |
| Loading state | Skeleton rows or spinner while fetching |
| Error state | Banner with retry button on API failure |

**Interactions:**
- Typing in search triggers `GET /tickets?search=...` (preserves status filter)
- Changing status filter triggers `GET /tickets?status=...` (preserves search)
- Clicking ticket title navigates to `/tickets/[id]`

**Data dependencies:** `GET /tickets`

---

### 7.3 Create Ticket Page

**Route:** `/tickets/new` (`app/tickets/new/page.tsx`)

**Purpose:** Create a new support ticket.

**Form fields:**

| Field | Control | Required |
|-------|---------|----------|
| Title | Text input | Yes |
| Description | Textarea | Yes |
| Priority | Select dropdown | Yes |
| Created By | User select (seeded users) | Yes — default to first user |
| Assignee | User select with "Unassigned" option | No |

**Actions:**
- "Create Ticket" (submit) → `POST /tickets` → redirect to `/tickets/[id]` on success
- "Cancel" → navigate back to `/tickets`

**States:**
- Submitting: disable form, show spinner on button
- Validation error: inline field errors from API `details[]`
- Server error: banner at top of form

**Data dependencies:** `GET /users` (for dropdowns)

---

### 7.4 Ticket Detail Page

**Route:** `/tickets/[id]` (`app/tickets/[id]/page.tsx`)

**Purpose:** View full ticket, edit fields, change status, manage comments.

**Layout sections:**

#### A. Ticket Header
- Title (large)
- Status badge (color-coded)
- Priority badge
- Created / updated timestamps
- Creator name
- Current assignee name (or "Unassigned")

#### B. Ticket Fields Editor
- Editable: title, description, priority, assignee
- "Save Changes" button → `PATCH /tickets/:id`
- Inline success toast or message on save
- Field-level errors on validation failure

#### C. Status Transition Control
- Shows current status prominently
- Buttons or dropdown for **only** valid next statuses
- Confirmation optional for `CANCELLED` (recommended: simple confirm dialog)
- Error banner on invalid transition response

#### D. Comments Section
- Heading: "Comments (N)"
- Chronological list: author name, timestamp, message body
- Empty state: "No comments yet"
- Add comment form: message textarea + author select (seeded users) + "Add Comment" button
- On success: append comment to list without full page reload (re-fetch or optimistic update)

**States:**
- Loading: full-page spinner on initial load
- Not found: "Ticket not found" with link back to list
- Error: banner with retry

**Data dependencies:**
- `GET /tickets/:id`
- `GET /users` (for assignee and comment author dropdowns)
- `PATCH /tickets/:id`
- `PATCH /tickets/:id/status`
- `POST /tickets/:id/comments`

---

### 7.5 Root Page

**Route:** `/` (`app/page.tsx`)

**Behavior:** Redirect to `/tickets`

---

### 7.6 UI Status & Priority Badge Colors (Recommendation)

| Status | Color |
|--------|-------|
| `OPEN` | Blue |
| `IN_PROGRESS` | Yellow/Amber |
| `RESOLVED` | Green |
| `CLOSED` | Gray |
| `CANCELLED` | Red |

| Priority | Color |
|----------|-------|
| `LOW` | Gray |
| `MEDIUM` | Blue |
| `HIGH` | Orange |
| `CRITICAL` | Red |

---

### 7.7 Acting User Pattern (No Auth)

Since there is no login, the UI provides a **"Acting as"** user selector in the layout header (persisted in `localStorage`). This selection pre-fills `createdById` on new tickets and comments. User can override per form. Document this behavior in README.

---

## 8. Error Handling Strategy

### 8.1 Backend Error Architecture

```
Request
  → Route
    → validate middleware (Zod)     → 400 VALIDATION_ERROR
    → Controller
      → Service
        → throws AppError             → passed to error handler
        → Prisma errors               → mapped in error handler
  → error-handler middleware          → consistent JSON response
```

### 8.2 AppError Class Design

| Property | Type | Description |
|----------|------|-------------|
| `statusCode` | number | HTTP status |
| `code` | string | Machine-readable error code |
| `message` | string | Human-readable message |
| `details` | array (optional) | Field-level errors |

### 8.3 Prisma Error Mapping

| Prisma Code | HTTP | App Code |
|-------------|------|----------|
| `P2025` (record not found) | 404 | `NOT_FOUND` |
| `P2003` (FK constraint) | 400 | `INVALID_REFERENCE` |
| Other | 500 | `INTERNAL_ERROR` (log full error, return generic message) |

### 8.4 Middleware Stack Order

1. `cors`
2. `express.json()`
3. Request logging (dev only)
4. Routes
5. `not-found` handler (404 for unknown routes)
6. `error-handler` (must be last)

### 8.5 Error Response Rules

- Never expose stack traces in API responses
- Log full errors server-side with request ID or path
- Always return `{ error: { code, message, details? } }` for 4xx/5xx
- `details` populated for validation errors; omitted for unexpected 500s

### 8.6 Frontend Error Handling

| Scenario | UI Behavior |
|----------|-------------|
| Network failure | Banner: "Unable to reach server. Check your connection." + Retry |
| 400 validation | Map `details[]` to form field errors |
| 400 status transition | Banner with server `message` |
| 404 | Dedicated not-found view |
| 500 | Banner: "Something went wrong. Please try again." |
| Unexpected JSON | Generic error message |

**Implementation:** `frontend/src/lib/errors.ts` exports `parseApiError(response)` returning typed error object. `api-client.ts` throws `ApiError` on non-2xx responses.

### 8.7 Logging

| Environment | Level |
|-------------|-------|
| Development | `debug` — log requests and errors with stack |
| Test | `warn` — suppress noise |
| Production | `error` — log errors only |

Use structured logging (e.g. `pino` or `console` with JSON) — keep dependency minimal for Core.

---

## 9. Testing Strategy

### 9.1 Scope (Core Mandate)

The mandatory test tier is **integration tests for the ticket status state machine**. No unit test tier is required for Core submission, though service-level tests may be added optionally.

### 9.2 Test Stack

| Tool | Purpose |
|------|---------|
| Vitest | Test runner |
| Supertest | HTTP assertions against Express `app` |
| Prisma | Test DB setup/teardown |
| `@shared/status-machine` | Imported in tests for expected transition assertions |

### 9.3 Test Environment

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://...ticket_management_test` |
| `NODE_ENV` | `test` |

**Setup (`tests/setup.ts`):**
1. Load test env
2. Run `prisma migrate deploy`
3. Seed users (minimal — state machine tests create own tickets)
4. Export Prisma client for direct DB assertions where needed

**Teardown:**
- Delete test-created tickets after each test (cascade deletes comments)
- Or wrap each test in a transaction and roll back (if supported by test harness)

### 9.4 Test File

**Location:** `backend/tests/integration/ticket-status-machine.test.ts`

Uses Express app from `src/app.ts` (no port binding).

### 9.5 Test Helpers

| Helper | Purpose |
|--------|---------|
| `createTestApp()` | Returns Supertest agent |
| `createTicket(overrides?)` | POST ticket, returns ID |
| `transitionTicket(id, status)` | PATCH status endpoint |
| `getTicket(id)` | GET ticket for assertion |

### 9.6 Required Test Cases

#### Valid Transitions (must return `200`)

| Test Name | Setup Status | Action | Expected Status |
|-----------|--------------|--------|-----------------|
| Open → In Progress | `OPEN` | → `IN_PROGRESS` | `IN_PROGRESS` |
| In Progress → Resolved | `IN_PROGRESS` | → `RESOLVED` | `RESOLVED` |
| Resolved → Closed | `RESOLVED` | → `CLOSED` | `CLOSED` |
| Open → Cancelled | `OPEN` | → `CANCELLED` | `CANCELLED` |
| In Progress → Cancelled | `IN_PROGRESS` | → `CANCELLED` | `CANCELLED` |

#### Invalid Transitions (must return `400` with `INVALID_STATUS_TRANSITION`)

| Test Name | Setup Status | Action |
|-----------|--------------|--------|
| Open → Resolved | `OPEN` | → `RESOLVED` |
| Open → Closed | `OPEN` | → `CLOSED` |
| In Progress → Open | `IN_PROGRESS` | → `OPEN` |
| Resolved → In Progress | `RESOLVED` | → `IN_PROGRESS` |
| Resolved → Cancelled | `RESOLVED` | → `CANCELLED` |
| Closed → In Progress | `CLOSED` | → `IN_PROGRESS` |
| Cancelled → Open | `CANCELLED` | → `OPEN` |

#### Supporting Assertions

| Test | Assertion |
|------|-----------|
| Invalid transition body | `error.code === 'INVALID_STATUS_TRANSITION'` |
| Invalid transition persistence | DB status unchanged after rejected transition |
| Not found | `PATCH /tickets/non-existent-uuid/status` → `404` |
| Invalid enum | `PATCH` with `status: "INVALID"` → `400 VALIDATION_ERROR` |

### 9.7 Running Tests

Document in README:

```
cd backend
cp .env.example .env.test	# configure test DATABASE_URL
npm test                        # runs vitest
```

### 9.8 Manual Test Checklist (README)

Integration tests cover the state machine. README should include a manual checklist for full acceptance:

- [ ] Create ticket via UI
- [ ] List shows ticket from DB
- [ ] Search by keyword works
- [ ] Filter by status works
- [ ] Update title, priority, assignee
- [ ] Add comment
- [ ] Each valid status transition via UI
- [ ] Invalid transition shows error in UI
- [ ] Restart app — data persists

### 9.9 What Is Not Tested (Core)

- Frontend component tests
- E2E browser tests (Playwright/Cypress)
- Load/performance tests
- User CRUD, auth, pagination

---

## Appendix A: Environment Variables

### Backend (`backend/.env`)

| Variable | Example | Required |
|----------|---------|----------|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/ticket_management` | Yes |
| `PORT` | `3001` | No (default 3001) |
| `CORS_ORIGIN` | `http://localhost:3000` | No |
| `NODE_ENV` | `development` | No |

### Frontend (`frontend/.env.local`)

| Variable | Example | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api/v1` | Yes |

### Root (`.env.example`)

Document both backend and frontend variables with placeholder values. Never commit real credentials.

---

## Appendix B: README Setup Steps (Summary)

1. Install Node.js 20+, PostgreSQL 15+
2. Clone repository
3. Create PostgreSQL databases: `ticket_management`, `ticket_management_test`
4. Copy env files from examples
5. `cd backend && npm install && npx prisma migrate dev && npx prisma db seed`
6. `cd frontend && npm install`
7. Start backend: `npm run dev` (port 3001)
8. Start frontend: `npm run dev` (port 3000)
9. Run tests: `cd backend && npm test`

---

## Appendix C: Traceability Matrix

| Requirement | Spec Section | Primary Artifact |
|-------------|--------------|------------------|
| Create ticket | §3.4 POST /tickets, §7.3 | Ticket form page |
| List tickets | §3.4 GET /tickets, §7.2 | Ticket list page |
| Ticket detail | §3.4 GET /tickets/:id, §7.4 | Detail page |
| Update fields | §3.4 PATCH /tickets/:id, §7.4 | Field editor |
| Status machine | §6, §3.4 PATCH status | `ticket-status.service.ts` |
| Comments | §3.4 POST comments, §7.4 | Comment section |
| Search/filter | §3.4 GET query params, §7.2 | Filters bar |
| Integration tests | §9 | `ticket-status-machine.test.ts` |
| Persistence | §2 | Prisma + PostgreSQL |
| Validation | §4 | Zod validators |

---

*End of technical specification.*

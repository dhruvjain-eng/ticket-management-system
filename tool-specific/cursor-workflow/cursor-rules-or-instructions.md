# Cursor Project Rules: Support Ticket Management System

This document defines Cursor rules for the Core Support Ticket Management System. Split into focused `.mdc` files under `.cursor/rules/` as shown below.

**Authoritative references (read before implementing):**
- `tool-specific/cursor-workflow/spec.md`
- `tool-specific/cursor-workflow/acceptance-criteria.md`
- `tool-specific/cursor-workflow/tasks.md`
- `tool-specific/cursor-workflow/project-context.md`

**Scope:** Core only. Do not implement Stretch features (auth, user CRUD, pagination, Docker, Swagger, etc.).

---

## Rule File Index

| File | Scope | `alwaysApply` |
|------|-------|---------------|
| `project-core.mdc` | Global project context and workflow | `true` |
| `typescript-standards.mdc` | All TypeScript files | `false` |
| `backend-architecture.mdc` | Express backend | `false` |
| `frontend-nextjs.mdc` | Next.js frontend | `false` |
| `prisma-database.mdc` | Prisma schema, migrations, seed | `false` |
| `api-rest-contracts.mdc` | Routes, controllers, API client | `false` |
| `validation-errors.mdc` | Zod validators and error handling | `false` |
| `testing.mdc` | Integration tests | `false` |

---

## `.cursor/rules/project-core.mdc`

```markdown
---
description: Core project context, scope, and AI workflow for Support Ticket Management System
alwaysApply: true
---

# Support Ticket Management System — Core Rules

## Stack
- Frontend: Next.js 14+ App Router, TypeScript, React (port 3000)
- Backend: Node.js, Express, TypeScript (port 3001)
- Database: PostgreSQL via Prisma ORM
- API: REST JSON at `/api/v1`
- Shared: `packages/shared` for enums, types, status-machine map

## Scope (Mandatory Core Only)
Implement: tickets, comments, seeded users, search, status filter, state machine, integration tests.
Do NOT implement: auth, user CRUD UI, pagination, priority/assignee filters, Docker, CI, Swagger.

## Before Writing Code
1. Read relevant sections of `tool-specific/cursor-workflow/spec.md`.
2. Explain what you will build: files affected, approach, and why.
3. Confirm the change maps to a single small task from `tasks.md` (15–30 min scope).
4. Then implement — never skip the explanation step.

## Incremental Delivery
- One small task per response. Never generate a large feature in one shot.
- Example good scope: "Add Zod schema for ticket create" or "Add StatusTransitionControl component".
- Example bad scope: "Build the entire backend" or "Implement all frontend pages".
- After each increment, summarize what changed and what task comes next.

## Monorepo Layout
- `backend/` — Express API + Prisma
- `frontend/` — Next.js App Router
- `packages/shared/` — enums, types, `ALLOWED_TRANSITIONS`
- Business logic (especially state machine) lives in backend services; shared map is for UX hints only.

## Secrets
- Never commit `.env`, credentials, or real `DATABASE_URL` values.
- Only `.env.example` with placeholders in the repo.

## State Machine (Critical)
Allowed transitions only:
- OPEN → IN_PROGRESS, CANCELLED
- IN_PROGRESS → RESOLVED, CANCELLED
- RESOLVED → CLOSED
- CLOSED, CANCELLED → terminal (no transitions)

Backend enforces all rules. Frontend may disable invalid options but must handle API rejection.
```

---

## `.cursor/rules/typescript-standards.mdc`

```markdown
---
description: TypeScript conventions for the ticket management monorepo
globs: "**/*.{ts,tsx}"
alwaysApply: false
---

# TypeScript Standards

## General
- Strict mode enabled in all `tsconfig.json` files.
- No `any`. Use `unknown` and narrow, or define proper types.
- Prefer `interface` for object shapes; `type` for unions and utility types.
- Export types from `packages/shared` when used by both frontend and backend.

## Naming
- Files: `kebab-case.ts` (e.g. `ticket-status.service.ts`)
- Components: `PascalCase.tsx` (e.g. `TicketList.tsx`)
- Functions/variables: `camelCase`
- Enums/constants: `UPPER_SNAKE_CASE` for enum values, `PascalCase` for enum names
- API JSON fields: `camelCase` in TypeScript; map from Prisma `snake_case` if needed

## Imports
- Use path aliases (`@/`) within frontend and backend packages.
- Import shared types from `@ticket-mgmt/shared`, not by copying enums.
- Order: external → shared → internal → relative.

## Async
- Always `async/await`; avoid raw `.then()` chains.
- Do not swallow errors in empty `catch` blocks.

## Examples

```typescript
// ❌ BAD
const data: any = await response.json();

// ✅ GOOD
const data = await response.json() as TicketDetail;
// or use typed api-client that returns TicketDetail
```
```

---

## `.cursor/rules/backend-architecture.mdc`

```markdown
---
description: Express backend clean architecture and layer responsibilities
globs: "backend/**/*.{ts,tsx}"
alwaysApply: false
---

# Backend Clean Architecture

## Layer Flow (strict — do not skip layers)
```
Routes → Controllers → Services → Prisma
         ↑ Validators (Zod middleware before controller)
```

| Layer | Responsibility | Must NOT do |
|-------|----------------|-------------|
| `routes/` | Mount paths, attach middleware | Business logic, Prisma calls |
| `controllers/` | Parse request, call service, format response | DB queries, validation rules |
| `services/` | Business logic, orchestration | HTTP status codes directly |
| `validators/` | Zod schemas, input shape | DB access |
| `middleware/` | Cross-cutting: errors, CORS, validate | Domain logic |
| `lib/prisma.ts` | Singleton client | — |

## File Placement
- New endpoint: route → controller method → service method → (optional) validator schema.
- State machine logic: ONLY in `services/ticket-status.service.ts`.
- `app.ts` exports Express app without `listen()` for Supertest.

## Response Envelope
Always return:
- Success: `{ data: T, meta?: { count: number } }`
- Error: `{ error: { code, message, details? } }`

## Controllers
- Thin: call service, map result to HTTP response, pass errors to `next(err)`.
- Use correct status codes: 200, 201, 400, 404, 500.

## Services
- Throw `AppError` for expected failures (not found, invalid transition).
- Let Prisma errors bubble to error-handler middleware for mapping.

## Do Not
- Put Prisma calls in routes or controllers.
- Duplicate state-machine logic outside `ticket-status.service.ts` and `@ticket-mgmt/shared`.
- Add auth middleware (out of Core scope).
```

---

## `.cursor/rules/frontend-nextjs.mdc`

```markdown
---
description: Next.js App Router frontend patterns and component structure
globs: "frontend/**/*.{ts,tsx}"
alwaysApply: false
---

# Next.js App Router — Frontend Rules

## Routing
- Use App Router only (`frontend/src/app/`).
- Pages: `/tickets`, `/tickets/new`, `/tickets/[id]`.
- Root `/` redirects to `/tickets`.

## Architecture
```
app/ (pages — thin, compose components)
components/ (reusable UI and feature components)
lib/api/ (typed API functions)
lib/api-client.ts (base fetch wrapper)
types/ (re-exports from @ticket-mgmt/shared)
```

## Pages vs Components
- **Pages** (`app/**/page.tsx`): data fetching orchestration, layout composition. Keep thin.
- **Components** (`components/`): reusable, prop-driven, no direct env access in leaf components.
- **API layer** (`lib/api/`): all HTTP calls go here — never raw `fetch` in components.

## Reusable Components
Extract when used more than once or when a page exceeds ~80 lines:
- `components/ui/` — Button, Input, Select, Textarea, Badge, LoadingSpinner
- `components/tickets/` — TicketList, TicketForm, StatusTransitionControl, etc.
- `components/layout/` — Header, ErrorBanner

## Client vs Server Components
- Prefer Server Components for static layout.
- Use `"use client"` only when needed: forms, interactivity, hooks, browser APIs.
- Acting-user context (`localStorage`) must be in a client component/provider.

## Data Fetching
- List/detail pages fetch from Express API via `lib/api/`, not from Prisma.
- Show loading, empty, and error states on every data-driven page.

## Business Rules
- Frontend mirrors allowed status transitions for UX only (from `@ticket-mgmt/shared`).
- Backend is authoritative — always handle `INVALID_STATUS_TRANSITION` from API.

## Styling
- Use one approach consistently (CSS Modules or Tailwind). Do not mix randomly.
- Status/priority badge colors per spec §7.6.

## Do Not
- Add Next.js API routes that duplicate Express (backend is the API).
- Implement auth or protected routes (Stretch).
- Filter/sort/paginate client-side when spec requires server-side search/filter.
```

---

## `.cursor/rules/prisma-database.mdc`

```markdown
---
description: Prisma schema, migrations, and PostgreSQL conventions
globs: "backend/prisma/**"
alwaysApply: false
---

# Prisma & PostgreSQL Rules

## Schema
- Single source of truth: `backend/prisma/schema.prisma`.
- Use UUID primary keys (`@default(uuid())` or `gen_random_uuid()`).
- Enums: `UserRole`, `TicketPriority`, `TicketStatus` — match `packages/shared`.
- Timestamps: `createdAt @default(now())`, `updatedAt @updatedAt`.

## Models
- `User` — seeded only, no CRUD endpoints beyond GET.
- `Ticket` — `status` defaults to `OPEN`; FK to User for `createdBy` and `assignedTo`.
- `Comment` — `onDelete: Cascade` from Ticket; `Restrict` on `createdBy`.

## Indexes
Include indexes on: `tickets.status`, `tickets.assignedToId`, `tickets.createdAt`, `comments.ticketId`.

## Migrations
- Never hand-edit applied migration SQL unless fixing a failed migration.
- Generate via `prisma migrate dev` with descriptive names.
- Document migrate/seed steps in README.

## Seed (`prisma/seed.ts`)
- Minimum: 4–5 users with mixed roles.
- Optional: sample tickets/comments for demo.
- State-machine tests create their own data — seed is not required for tests.

## Queries
- Prisma calls only in `services/` (via `lib/prisma.ts` singleton).
- Use `include`/`select` to avoid N+1 (embed assignee/creator names in list responses).
- Search: case-insensitive `ILIKE` on title and description (Core scope).

## Do Not
- Use raw SQL unless Prisma cannot express the query.
- Store secrets in schema or seed files.
- Add models beyond User, Ticket, Comment (Stretch).
```

---

## `.cursor/rules/api-rest-contracts.mdc`

```markdown
---
description: REST API contracts, endpoints, and frontend API client conventions
globs: "{backend/src/routes/**,backend/src/controllers/**,frontend/src/lib/api/**}"
alwaysApply: false
---

# REST API Contracts

## Base
- Prefix: `/api/v1`
- Content-Type: `application/json`
- Dates: ISO 8601 strings in responses

## Endpoints (Core)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/users` | List seeded users |
| GET | `/users/:id` | Get user |
| GET | `/tickets?search=&status=` | List with search/filter |
| POST | `/tickets` | Create (status always OPEN) |
| GET | `/tickets/:id` | Detail with comments |
| PATCH | `/tickets/:id` | Update fields (NOT status) |
| PATCH | `/tickets/:id/status` | State machine transition |
| POST | `/tickets/:id/comments` | Add comment |
| GET | `/health` | Health check |

## Error Codes
`VALIDATION_ERROR` | `INVALID_STATUS_TRANSITION` | `INVALID_REFERENCE` | `NOT_FOUND` | `INTERNAL_ERROR`

## Route Conventions
- Validate params (UUID), body, and query with Zod before controller.
- `POST` → 201; `GET`/`PATCH` success → 200.
- `PATCH /tickets/:id` must reject body containing `status`.

## Frontend API Client (`lib/api-client.ts`)
- Base URL from `NEXT_PUBLIC_API_URL`.
- Typed methods: `get<T>`, `post<T>`, `patch<T>`.
- Non-2xx → throw `ApiError` parsed from `{ error: { code, message, details } }`.
- One module per resource: `lib/api/tickets.ts`, `lib/api/users.ts`.

## Do Not
- Change response envelope shape without updating spec and frontend parser.
- Add undocumented endpoints.
- Return stack traces in JSON responses.
```

---

## `.cursor/rules/validation-errors.mdc`

```markdown
---
description: Input validation with Zod and centralized error handling
globs: "{backend/src/validators/**,backend/src/middleware/**,frontend/src/lib/errors.ts}"
alwaysApply: false
---

# Validation & Centralized Error Handling

## Backend Validation (Zod — authoritative)
- All request input validated before controller: `body`, `query`, `params`.
- Schemas live in `backend/src/validators/`.
- Use `validate(schema)` middleware from `middleware/validate.ts`.

### Key Rules (see spec §4)
- Ticket create: title, description, priority, createdById required; status ignored.
- Ticket update: at least one field; `status` field rejected.
- Comment: message + createdById required.
- Status transition: valid TicketStatus enum only.
- List query: optional search (max 200), optional status enum.

## AppError (`services` layer)
```typescript
// Expected failures — throw AppError, not generic Error
throw new AppError(404, 'NOT_FOUND', 'Ticket not found');
throw new AppError(400, 'INVALID_STATUS_TRANSITION', 'Cannot transition from CLOSED to OPEN');
```

## Error Handler Middleware (single place)
- `AppError` → appropriate HTTP status + `{ error: { code, message, details } }`
- Zod errors → 400 `VALIDATION_ERROR` with `details[]` per field
- Prisma P2025 → 404 `NOT_FOUND`
- Prisma P2003 → 400 `INVALID_REFERENCE`
- Unknown → 500 `INTERNAL_ERROR` (log full error server-side, generic message to client)

## Middleware Order
1. cors → 2. express.json() → 3. routes → 4. not-found → 5. error-handler (last)

## Frontend Error Display
- Parse API errors via `lib/errors.ts`.
- `VALIDATION_ERROR` → inline field errors from `details[]`.
- `INVALID_STATUS_TRANSITION` → ErrorBanner with server message.
- Network/500 → user-friendly banner with retry.
- Never show raw stack traces or internal codes without a human message.

## Do Not
- Validate only on the frontend.
- Catch and silence errors in controllers (use `next(err)`).
- Return different error shapes from different endpoints.
```

---

## `.cursor/rules/testing.mdc`

```markdown
---
description: Integration testing requirements for state machine
globs: "backend/tests/**"
alwaysApply: false
---

# Testing Rules (Core Mandatory Tier)

## Required
Integration tests for ticket status state machine in:
`backend/tests/integration/ticket-status-machine.test.ts`

## Stack
- Vitest + Supertest against exported `app` (no port binding).
- Separate test database via `DATABASE_URL` in test env.

## Must Cover
**Valid (200):** OPEN→IN_PROGRESS, IN_PROGRESS→RESOLVED, RESOLVED→CLOSED, OPEN→CANCELLED, IN_PROGRESS→CANCELLED

**Invalid (400, INVALID_STATUS_TRANSITION, status unchanged in DB):**
OPEN→RESOLVED, OPEN→CLOSED, IN_PROGRESS→OPEN, RESOLVED→IN_PROGRESS, RESOLVED→CANCELLED, CLOSED→*, CANCELLED→*

**Edge:** 404 missing ticket, 400 invalid status enum.

## Test Structure
- `tests/setup.ts` — migrate + seed users.
- `tests/helpers/` — `createTestApp()`, `createTicket()`, `transitionTicket()`.
- Clean up created tickets in `afterEach`.

## When Adding Features
- If touching state machine: update integration tests in the same increment.
- Do not add large unit test suites unless requested (Stretch).

## Do Not
- Mock Prisma for state-machine tests — test against real test DB.
- Skip asserting DB state after rejected transitions.
```

---

## `tool-specific/cursor-workflow/cursor-rules-or-instructions.md`

Use this as the human-readable overview that complements `.cursor/rules/`.

```markdown
# Cursor Rules & Instructions

## Purpose
Guide AI-assisted development of the Support Ticket Management System (Core)
using spec-driven, incremental delivery.

## Primary References
1. spec.md — technical design
2. acceptance-criteria.md — Given/When/Then behavior
3. tasks.md — 15–30 minute implementation tasks
4. project-context.md — requirement analysis

## AI Workflow (Required)

### 1. Explain Before Writing
Before generating code, always state:
- Which task from tasks.md is being addressed
- Files to create or modify
- Approach and key decisions
- How the change will be verified

### 2. Small Increments Only
- One task per interaction (15–30 minutes of work).
- Never implement an entire feature layer (e.g. all routes, all pages) in one response.
- Prefer: schema → service → route → test → UI component → page wiring.

### 3. Spec-Driven
- If spec and code conflict, follow spec.md and note the discrepancy.
- Update spec only when deliberately changing design.

### 4. Validate Understanding
- For state machine work: list allowed transitions before coding.
- For API work: cite endpoint, method, and response shape from spec §3.

## Architecture Summary

| Tier | Technology | Responsibility |
|------|------------|----------------|
| Frontend | Next.js App Router | UI, API client, UX validation hints |
| Backend | Express + TypeScript | REST API, business logic, validation |
| Data | Prisma + PostgreSQL | Persistence, migrations, seed |
| Shared | packages/shared | Enums, types, transition map |

## Key Constraints
- No authentication
- No user management UI
- Backend enforces state machine
- Server-side search and status filter
- Centralized error handling on backend; ErrorBanner + inline errors on frontend
- No secrets in repo

## Suggested Prompt Patterns

**Good:**
> "Implement task T-037: Ticket status service. Explain approach first."

**Bad:**
> "Build the entire ticket management app."

**Good:**
> "Add Zod validator for POST /tickets per spec §4.2. One file only."

**Bad:**
> "Add all validators and routes."
```

---

## Installation Instructions

Create the rule files in the repository:

```text
.cursor/rules/
├── project-core.mdc
├── typescript-standards.mdc
├── backend-architecture.mdc
├── frontend-nextjs.mdc
├── prisma-database.mdc
├── api-rest-contracts.mdc
├── validation-errors.mdc
└── testing.mdc

tool-specific/cursor-workflow/
└── cursor-rules-or-instructions.md
```

Copy each fenced block body (below the frontmatter) into the corresponding file. Cursor will auto-load rules from `.cursor/rules/`.

---

## Quick Reference Card

| Rule | Enforcement |
|------|-------------|
| Explain before code | Always — in every response |
| Small increments | Max one `tasks.md` item per response |
| Clean architecture | Routes → Controllers → Services → Prisma |
| Validation | Zod on backend; UX hints on frontend |
| Errors | `AppError` + single error-handler middleware |
| State machine | `ticket-status.service.ts` + integration tests |
| Components | Reusable in `components/ui/` and `components/tickets/` |
| No Stretch | No auth, pagination, user CRUD, Docker, Swagger |
| Secrets | `.env.example` only; never commit real credentials |

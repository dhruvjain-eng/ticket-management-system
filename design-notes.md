# Design Notes

## Architecture Overview

Three-tier architecture with a decoupled frontend and backend:

```
┌─────────────────────┐     HTTP/JSON      ┌─────────────────────┐
│  Next.js Frontend   │ ◄────────────────► │  Express API        │
│  localhost:3000     │   /api/v1          │  localhost:3001     │
└─────────────────────┘                    └──────────┬──────────┘
                                                    │ Prisma
                                                    ▼
                                         ┌─────────────────────┐
                                         │  PostgreSQL         │
                                         └─────────────────────┘
```

**Core only** — no API gateway, no auth service, no message queue.

---

## Frontend Design

### Stack
- Next.js 16 App Router, TypeScript, Tailwind CSS

### Structure
- **Routes:** `frontend/src/app/` — thin page files delegate to view components
- **Views:** `*View.tsx` — orchestration, hooks, mutation state
- **Components:** Presentational UI (`TicketTable`, `TicketForm`, etc.)
- **Hooks:** `useTicketList`, `useTicket`, `useUsers`, `useDebouncedValue` — read state + `reload()`
- **Context:** `ActingUserContext` — selected seeded user (`localStorage`)
- **Lib:** `api-client.ts` (fetch + `ApiError`), `api/tickets.ts`, `api/users.ts`, `status-machine.ts` (UX mirror of backend rules)

### Patterns
| Concern | Layer |
|---------|-------|
| HTTP transport | `lib/api-client.ts` |
| Loading/error for reads | Custom hooks |
| Mutation loading/errors | View components (local `useState`) |
| Route-level fallback | `app/loading.tsx`, `app/error.tsx` |
| Form validation UX | `lib/form-validation.ts` |

### Routes
| Path | Purpose |
|------|---------|
| `/` | Redirect to `/tickets` |
| `/tickets` | List + search + filter |
| `/tickets/new` | Create ticket |
| `/tickets/[id]` | Detail, edit, status, comments |

---

## Backend Design

### Stack
- Express 5, TypeScript, Zod, Prisma 7, PostgreSQL

### MVC layout (`backend/src/`)
| Layer | Responsibility |
|-------|----------------|
| `routes/` | HTTP method + path wiring |
| `controllers/` | Parse request, call service, send response |
| `services/` | Business logic, Prisma access |
| `validators/` | Zod schemas |
| `middleware/` | Validation, error handler, not-found |
| `utils/` | Mappers, `AppError`, async handler |

### Key services
- **`ticket.service.ts`** — CRUD, search (`ILIKE` on title/description), status filter
- **`status-transition.service.ts`** — **authoritative** state machine; only place status changes
- **`comment.service.ts`** — Create comment; included in ticket detail
- **`user.service.ts`** — List/get seeded users

### API conventions
- Base: `/api/v1`
- Success: `{ "data": ... }`
- Error: `{ "error": { "code", "message", "details?" } }`
- `app.ts` exported for Supertest (no `listen()` in app module)

---

## Database Design

- **ORM:** Prisma 7 with PostgreSQL
- **Schema:** `backend/prisma/schema.prisma`
- **Migrations:** `backend/prisma/migrations/`
- **Seed:** `backend/prisma/seed.ts` — 5 users, 10 tickets, 15 comments

See [data-model.md](data-model.md) for entity details.

### Referential integrity
- `Ticket.createdBy` → `User` (Restrict on delete)
- `Ticket.assignedTo` → `User` (SetNull on delete)
- `Comment` → `Ticket` (Cascade on delete)

---

## Validation Strategy

### Backend (authoritative)
- Zod schemas in `backend/src/validators/`
- `validate` middleware stores parsed input in `res.locals.validated` (Express 5 compatible)
- Ticket create: required title, description, priority, `createdById`; optional `assignedToId`
- Ticket update: at least one field; **status rejected** on general PATCH
- Status transition: dedicated endpoint + `status-transition.service.ts`
- Comment: required `message`, `createdById`

### Frontend (UX)
- Required field markers and disabled submit until valid
- `aria-invalid`, `aria-describedby`, `role="alert"` on errors
- Status dropdown limited to allowed transitions via `lib/status-machine.ts`

---

## Error Handling Strategy

| Layer | Behavior |
|-------|----------|
| Service | Throws `AppError` with HTTP status + code |
| Prisma | FK/unique errors mapped in error handler |
| Middleware | `error-handler.ts` — consistent JSON envelope |
| Frontend API client | Parses error body → `ApiError` class |
| UI | `ErrorBanner` with retry; form field errors inline |

**Common codes:** `VALIDATION_ERROR`, `NOT_FOUND`, `INVALID_STATUS_TRANSITION`, `INTERNAL_ERROR`

---

## Testing Strategy Link

Integration tests focus on the status state machine (mandatory Core test tier).

Details: [test-strategy.md](test-strategy.md) · Results: [test-results.md](test-results.md)

---

## Intentionally Out of Scope (Stretch)

Authentication, user CRUD UI, pagination, priority/assignee filters, sorting, Swagger, Docker, CI, `GET /health`, unit tests for every service.

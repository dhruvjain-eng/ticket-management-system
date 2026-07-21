# Acceptance Criteria

**Project:** Support Ticket Management System (Core only)  
**Stretch features:** Intentionally excluded (auth, user CRUD UI, pagination, Docker, Swagger, etc.)

This file is the **submission checklist** aligned with the official assessment guide. Detailed Given/When/Then criteria live in [tool-specific/cursor-workflow/acceptance-criteria.md](tool-specific/cursor-workflow/acceptance-criteria.md).

---

## Core Functionality

Official Core acceptance criteria from the assessment guide:

- [x] **1.** A user can create a ticket via the UI.
- [x] **2.** A user can view all tickets from the database.
- [x] **3.** A user can open a ticket detail view.
- [x] **4.** A user can update ticket fields and reassign.
- [x] **5.** A user can add comments.
- [x] **6.** Status changes only through valid transitions; invalid ones are rejected.
- [x] **7.** Keyword search and status filter work.
- [x] **8.** Data remains available after restart.
- [x] **9.** Backend validation prevents invalid records.
- [x] **10.** No secrets committed to the repo.
- [x] **11.** State-machine integration tests pass.

### Implementation evidence

| Criterion | How it is met |
|-----------|---------------|
| Create ticket | `POST /api/v1/tickets` + `/tickets/new` UI |
| List tickets | `GET /api/v1/tickets` + `/tickets` UI |
| Ticket detail | `GET /api/v1/tickets/:id` + `/tickets/[id]` UI |
| Update fields | `PATCH /api/v1/tickets/:id` + inline edit UI |
| Comments | `POST /api/v1/tickets/:id/comments` + `CommentForm` |
| Status machine | `PATCH /api/v1/tickets/:id/status` + `status-transition.service.ts` |
| Search/filter | `?search=` and `?status=` query params + debounced UI |
| Persistence | PostgreSQL via Prisma migrations + seed |
| Restart survival | Data stored in DB, not in-memory |

### Status state machine (Core)

| From | Allowed to |
|------|------------|
| OPEN | IN_PROGRESS, CANCELLED |
| IN_PROGRESS | RESOLVED, CANCELLED |
| RESOLVED | CLOSED |
| CLOSED | *(terminal)* |
| CANCELLED | *(terminal)* |

---

## Validation

- [x] Required fields enforced on ticket create (title, description, priority, `createdById`)
- [x] Zod validation on all API inputs (`backend/src/validators/`)
- [x] Invalid enum values rejected with `VALIDATION_ERROR`
- [x] Status cannot be changed via general `PATCH /tickets/:id` (dedicated status endpoint only)
- [x] Foreign keys validated (`createdById`, `assignedToId`, `ticketId`)
- [x] Client-side required-field UX (disabled submit, field hints) on create/edit/comment forms

---

## Error Handling

- [x] Consistent API error envelope: `{ error: { code, message, details? } }`
- [x] `INVALID_STATUS_TRANSITION` returned for disallowed status changes (HTTP 400)
- [x] `NOT_FOUND` for missing tickets/users (HTTP 404)
- [x] `VALIDATION_ERROR` for invalid request bodies/query (HTTP 400)
- [x] Frontend `ErrorBanner` with retry (`reload()`)
- [x] Invalid transitions surfaced clearly in ticket detail UI
- [x] Global error boundary (`frontend/src/app/error.tsx`)

---

## Testing

- [x] Mandatory Core test tier: **integration tests for status state machine**
- [x] **Unit tests** for status-machine rules and Zod validators (`backend/tests/unit/`)
- [x] Test file: `backend/tests/integration/ticket-status-machine.test.ts`
- [x] **15 tests** covering:
  - 5 valid transitions (OPEN→IN_PROGRESS, IN_PROGRESS→RESOLVED, RESOLVED→CLOSED, OPEN→CANCELLED, IN_PROGRESS→CANCELLED)
  - 7 invalid transitions (parameterized)
  - 3 edge cases (404 not found, invalid enum, idempotent OPEN→OPEN)
- [x] Run with: `cd backend && npm test`

See [test-strategy.md](test-strategy.md) and [test-results.md](test-results.md).

**Not in Core scope:** unit tests for every service, component tests, E2E browser tests.

---

## Documentation

- [x] [README.md](README.md) — setup, env vars, migrations, seed, run commands, screenshots
- [x] [tool-workflow.md](tool-workflow.md) — Part A AI workflow
- [x] [requirements-analysis.md](requirements-analysis.md) — requirement analysis
- [x] [implementation-plan.md](implementation-plan.md) — task breakdown
- [x] [design-notes.md](design-notes.md) — architecture and design
- [x] [api-contract.md](api-contract.md) — REST API contract
- [x] [data-model.md](data-model.md) — database entities
- [x] [ui-flow.md](ui-flow.md) — UI routes and flows
- [x] [debugging-notes.md](debugging-notes.md) — debugging evidence
- [x] [code-review-notes.md](code-review-notes.md) — review observations
- [x] [review-fixes.md](review-fixes.md) — fixes after review
- [x] [pr-description.md](pr-description.md) — PR-style summary
- [x] [reflection.md](reflection.md) — lifecycle reflection
- [x] [final-ai-usage-summary.md](final-ai-usage-summary.md) — AI usage summary
- [x] [candidate-info.md](candidate-info.md) — candidate information
- [x] [ai-prompts/](ai-prompts/) — prompt history grouped by activity
- [x] [tool-specific/cursor-workflow/prompt-history.md](tool-specific/cursor-workflow/prompt-history.md) — full chronological prompt log
- [x] [tool-specific/cursor-workflow/](tool-specific/cursor-workflow/) — spec, tasks, project context, Cursor rules

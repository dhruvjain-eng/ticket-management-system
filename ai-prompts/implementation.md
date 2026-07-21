# Implementation Prompts

Curated summaries from [tool-specific/cursor-workflow/prompt-history.md](../tool-specific/cursor-workflow/prompt-history.md).  
Each backend task used planning docs as source of truth with explicit stop points.

---

## Entry 1 — Backend scaffold (Task 1)

**Prompt:** Implement Task 1 only — Express + TypeScript MVC folders, `app.ts`, `server.ts`, CORS, JSON, placeholder error handler. No APIs, no Prisma schema changes.

**AI response summary:** Created backend scaffold with config, routes, controllers, services, middleware, validators, utils, types.

**Accepted:** MVC layout; `app.ts` factory without `listen()`.

**Changed:** N/A

**Rejected:** Implementing APIs early.

**Why:** Incremental scope per task list.

---

## Entry 2 — Prisma schema (Task 2)

**Prompt:** Create schema with User, Ticket, Comment enums/models; UUID PKs; indexes; relationships. No migrations, seed, or APIs.

**AI response summary:** Defined `UserRole`, `TicketPriority`, `TicketStatus`, three models with FK rules.

**Accepted:** Schema matches spec §2.

**Changed:** N/A

**Rejected:** N/A

---

## Entry 3 — Seed script (Task 3)

**Prompt:** Seed 5 users, 10 tickets, 15 comments; configure `package.json` seed command.

**AI response summary:** Realistic seed data; Prisma 7 seed with adapter.

**Accepted:** Full seed script and `npm run db:seed`.

**Changed:** N/A

**Rejected:** N/A

---

## Entry 4 — Users module (Task 4)

**Prompt:** `GET /api/users` — route, controller, service. No ticket APIs.

**AI response summary:** Implemented `GET /api/v1/users`; ESM module setup.

**Accepted:** Users list endpoint; `"type": "module"`.

**Changed:** API path uses `/api/v1` per spec (prompt said `/api/users`).

**Rejected:** User CRUD beyond read.

**Why:** Core — seeded users only.

---

## Entry 5 — Ticket module (Task 5)

**Prompt:** Full ticket CRUD + search/filter; Zod validation; no status transitions or comments.

**AI response summary:** GET/POST/PATCH tickets; `ILIKE` search; status filter; mappers.

**Accepted:** Complete ticket module except status/comments.

**Changed:** Validated query via `res.locals.validated` after Express 5 issue (see debugging.md).

**Rejected:** Status updates on general PATCH.

**Why:** State machine requires dedicated endpoint.

---

## Entry 6 — Status transitions (Task 6)

**Prompt:** `PATCH /api/tickets/:id/status`; dedicated `StatusTransitionService`; Zod validation.

**AI response summary:** Transition map in service; `INVALID_STATUS_TRANSITION` errors with allowed targets.

**Accepted:** Authoritative backend state machine.

**Changed:** N/A

**Rejected:** N/A

---

## Entry 7 — Comments (Task 7)

**Prompt:** `POST /api/tickets/:id/comments`; include comments in `GET /api/v1/tickets/:id`.

**AI response summary:** Comment service + validator; ordered comments in detail.

**Accepted:** Full comments API.

**Changed:** N/A

**Rejected:** N/A

---

## Entry 8 — Simplify frontend (remove monorepo)

**Prompt:** Remove `packages/shared` and workspace config; keep backend + frontend only; duplicate minimal types in frontend.

**AI response summary:** Deleted workspace root and shared package; local types in `frontend/src/types/`.

**Accepted:** Two-app layout.

**Changed:** Imports updated to `@/types`.

**Rejected:** Monorepo/shared package.

**Why:** Assessment simplicity requirement.

---

## Entry 9 — Ticket UI + Comments UI

**Prompt:** Build ticket list/create/detail/edit/status UI; then comments on detail with refresh after create.

**AI response summary:** Full frontend workflow with hooks, components, acting-user context; `CommentList`/`CommentForm`.

**Accepted:** All Core UI flows.

**Changed:** Dashboard removed in review phase.

**Rejected:** Stretch UI (user management, pagination).

**Why:** Core scope only.

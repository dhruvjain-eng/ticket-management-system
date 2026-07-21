# PR Description

> This document describes the full project as if submitted as a single pull request. The repository was built incrementally via AI-assisted tasks rather than a traditional feature branch.

---

## Summary

Implements the **Support Ticket Management System (Core)** for the JS–AI Capability Exercise: a full-stack TypeScript application with Express + Prisma + PostgreSQL backend and Next.js frontend. Users can manage support tickets, transition statuses through an enforced state machine, and add comments. Keyword search and status filtering are supported.

**Stretch features were intentionally excluded.**

---

## Features Implemented

### Backend
- REST API at `/api/v1` for users, tickets, status transitions, and comments
- Zod validation and centralized error handling
- Prisma schema, migrations, and seed data (5 users, 10 tickets, 15 comments)
- Status state machine in dedicated service layer
- 15 integration tests for valid/invalid transitions and edge cases

### Frontend
- Ticket list with debounced search and status filter
- Create ticket form with acting-user pre-fill
- Ticket detail with inline edit, status control, and comments
- Loading and error states; client-side required-field validation
- Accessibility improvements (ARIA attributes, responsive table)

---

## Technical Changes

| Area | Details |
|------|---------|
| Backend | Express 5 MVC, ESM (`"type": "module"`), `tsx` dev runner |
| Database | PostgreSQL via Prisma 7; `moduleFormat = "esm"` for test compatibility |
| Frontend | Next.js 16 App Router, Tailwind, self-contained types (no monorepo) |
| Testing | Jest + Supertest integration tests against real DB |

---

## Database Changes

- **Initial migration:** `backend/prisma/migrations/20260714060235_init/`
- **Models:** `User`, `Ticket`, `Comment`
- **Enums:** `UserRole`, `TicketPriority`, `TicketStatus`
- **Seed:** `npm run db:seed` in `backend/`

---

## Testing Done

```bash
cd backend && npm test    # 15 integration tests
cd frontend && npm run build
```

Manual verification: ticket CRUD, search/filter, status transitions (valid + invalid), comments, error states.

See [test-results.md](test-results.md) and [test-strategy.md](test-strategy.md).

---

## AI Usage Summary

- **Planning:** Requirement analysis, spec, tasks, acceptance criteria, Cursor rules
- **Implementation:** Incremental backend Tasks 1–8, then frontend phases
- **Debugging:** ts-node-dev → tsx, Express 5 query fix, Jest/Prisma ESM config
- **Review:** Core gap analysis and targeted fixes
- **Documentation:** README, lifecycle artifacts, prompt history

Full prompt log: [tool-specific/cursor-workflow/prompt-history.md](tool-specific/cursor-workflow/prompt-history.md)

---

## Screenshots / Demo Notes

| Screen | Path |
|--------|------|
| Ticket list | `docs/screenshots/ticket-list.png` |
| Create ticket | `docs/screenshots/create-ticket.png` |
| Ticket details | `docs/screenshots/ticket-details.png` |
| Status transition | `docs/screenshots/status-transition.png` |
| Comments | `docs/screenshots/comments.png` |

**Demo flow:**
1. Start backend (`localhost:3001`) and frontend (`localhost:3000`)
2. Select acting user in header
3. Browse `/tickets` — search and filter
4. Create ticket at `/tickets/new`
5. Open detail — edit fields, transition status, add comment
6. Attempt invalid status transition — observe error message

---

## Known Limitations

- No authentication — acting-user selector only
- No pagination — full ticket list returned
- No user management UI — users are seed-only
- Integration tests only (no unit/component test suite)
- Requires external PostgreSQL (`DATABASE_URL`)

---

## Future Improvements (Stretch)

- JWT/session authentication and role-based access
- Pagination, sorting, priority/assignee filters
- Unit tests for services and React component tests
- OpenAPI documentation and Docker Compose for local dev
- CI pipeline running migrations + tests on push

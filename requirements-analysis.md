# Requirement Analysis

## Selected Project Option

**Support Ticket Management System** — mandatory **Core** scope only.

Stretch features (authentication, user CRUD, pagination, Docker, Swagger, etc.) were **intentionally excluded**.

---

## My Understanding (in your own words)

The exercise asks for a small full-stack app that demonstrates **AI-assisted engineering across the lifecycle**, not a large product. The Core application is a support ticket system where internal users manage tickets through a defined lifecycle, add comments, and search/filter persisted data.

The signature engineering judgment piece is the **status state machine**: only specific transitions are allowed, the backend must reject invalid moves, and integration tests must prove those rules. Users are **seeded only**—no login or user-management UI is required for Core.

The assessment values lifecycle artifacts (planning, prompt history, testing/debugging notes, reflection) as much as the running app.

---

## Functional Requirements

| ID | Requirement | Implemented |
|----|-------------|-------------|
| FR-1 | Create ticket via UI (title, description, priority, creator; status defaults OPEN) | Yes |
| FR-2 | List tickets from database with keyword search + status filter | Yes |
| FR-3 | View ticket detail including comments | Yes |
| FR-4 | Update title, description, priority, assignee (not status via PATCH) | Yes |
| FR-5 | Change status only through enforced state machine | Yes |
| FR-6 | Add comments to a ticket | Yes |
| FR-7 | Seeded users for creators, assignees, comment authors | Yes |
| FR-8 | Data persists across restarts | Yes |
| FR-9 | Backend validation + meaningful UI error states | Yes |
| FR-10 | Acting-user pattern (no auth) for create/comment forms | Yes |

### Status state machine (Core)

| From | To |
|------|-----|
| OPEN | IN_PROGRESS, CANCELLED |
| IN_PROGRESS | RESOLVED, CANCELLED |
| RESOLVED | CLOSED |
| CLOSED | *(terminal)* |
| CANCELLED | *(terminal)* |

---

## Non-Functional Requirements

| ID | Requirement | Approach |
|----|-------------|----------|
| NFR-1 | TypeScript end-to-end | Backend + frontend in TS |
| NFR-2 | REST API with consistent error shape | `{ error: { code, message, details? } }` |
| NFR-3 | Input validation at API boundary | Zod schemas + middleware |
| NFR-4 | Separation of concerns | MVC backend; hooks + presentational components on frontend |
| NFR-5 | Testability | `app.ts` exported without `listen()` for Supertest |
| NFR-6 | No secrets in repository | `.env` gitignored; `.env.example` with placeholders |
| NFR-7 | README setup from clean clone | Documented in [README.md](README.md) |

---

## Assumptions

1. **No authentication** — "Acting as" user selector replaces login for Core.
2. **Single-tenant** — one PostgreSQL database; no multi-org isolation.
3. **English UI** — no i18n required.
4. **Moderate data volume** — no pagination in Core; full list returned.
5. **API base path** — `/api/v1` (versioned).
6. **Two-app layout** — separate `backend/` and `frontend/` directories (not a monorepo workspace).

---

## Clarifications (questions for a product owner)

| Question | Decision taken for Core |
|----------|-------------------------|
| Should same-status transition be allowed? | Yes — idempotent `OPEN → OPEN` returns 200 |
| Is `GET /users/:id` required? | Added during polish for API completeness |
| Dashboard at `/`? | Removed; `/` redirects to `/tickets` per spec §7.5 |
| Client-side validation required? | Added required-field UX during acceptance review |

---

## Edge Cases

| Area | Edge case | Handling |
|------|-----------|----------|
| Status | Invalid transition (e.g. OPEN → CLOSED) | 400 `INVALID_STATUS_TRANSITION`; DB unchanged |
| Status | Transition on missing ticket | 404 `NOT_FOUND` |
| Status | Invalid enum in body | 400 `VALIDATION_ERROR` |
| Status | Terminal state transition | 400 with message that status is terminal |
| Tickets | Empty search string | Treated as no search filter |
| Tickets | Whitespace-only search | Trimmed to empty on frontend |
| Tickets | Unassign ticket | `assignedToId: null` on PATCH |
| Comments | Empty message | Rejected by Zod (min length 1) |
| Users | Invalid UUID references | 400 validation or Prisma FK error mapped |
| UI | API unreachable | Error banner + retry via `reload()` |

---

## Related Documents

- Detailed analysis: [tool-specific/cursor-workflow/project-context.md](tool-specific/cursor-workflow/project-context.md)
- Acceptance criteria: [tool-specific/cursor-workflow/acceptance-criteria.md](tool-specific/cursor-workflow/acceptance-criteria.md)
- Technical spec: [tool-specific/cursor-workflow/spec.md](tool-specific/cursor-workflow/spec.md)

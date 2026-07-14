# Requirement Analysis: Support Ticket Management System (Core Only)

Analysis is scoped strictly to the **mandatory Core** from the assessment. Stretch items (auth, user CRUD, pagination, priority/assignee filters, Docker, Swagger, etc.) are excluded.

---

## 1. Functional Requirements

### FR-1: Ticket Creation
- A user can create a ticket via the UI with at minimum: **title**, **description**, and **priority**.
- **createdBy** must be set (from seeded users; no auth UI required — e.g. fixed/default user or simple selector from seeded users).
- **status** defaults to **Open** on creation.
- **assignedTo** may be optional on create or set at creation time.
- Backend validates required fields and rejects invalid input with clear error messages.

### FR-2: Ticket Listing
- A user can view all tickets loaded from the database (not in-memory).
- List shows key fields: title, priority, status, assignee, created date (at minimum).
- List supports:
  - **Keyword search** (e.g. title/description).
  - **Filter by status** (Open, In Progress, Resolved, Closed, Cancelled).
- Search and filter can be combined.

### FR-3: Ticket Detail View
- A user can open a single ticket and see full details: title, description, priority, status, assignee, creator, timestamps.
- Detail view includes all **comments** for that ticket, ordered chronologically.

### FR-4: Ticket Field Updates
- A user can update: **title**, **description**, **priority**, **assignee** (`assignedTo`).
- Updates persist to the database.
- **updatedAt** is refreshed on successful update.
- Status is **not** updated through the general field-update flow; it uses the dedicated state machine (FR-5).

### FR-5: Status State Machine (Core Judgment Piece)
Allowed transitions only:

| From          | To            |
|---------------|---------------|
| Open          | In Progress   |
| In Progress   | Resolved      |
| Resolved      | Closed        |
| Open          | Cancelled     |
| In Progress   | Cancelled     |

Rules:
- Terminal states (**Closed**, **Cancelled**) allow no further transitions.
- **Resolved** may only move to **Closed** (not back to In Progress, etc.).
- Invalid transitions are **rejected by the backend** (4xx with a clear message).
- Frontend shows validation errors clearly and does not silently fail.

### FR-6: Comments
- A user can add a **comment** to a ticket (message text required).
- **createdBy** is set from seeded user context.
- **createdAt** is set automatically.
- Comments are tied to a ticket via `ticketId`.
- Comments appear on the ticket detail view after creation.

### FR-7: User Entity (Seeded Only)
- Users exist in the DB with: `id`, `name`, `email`, `role`.
- Provided via **seed data** only — **no user-management UI**.
- Seeded users are used for: `createdBy`, `assignedTo`, comment authors, and assignee selection in the UI.
- A read-only way to load users for dropdowns (API or embedded in ticket responses) is required for reassignment.

### FR-8: Data Persistence
- All tickets, comments, and users survive application and database restarts.
- No in-memory-only storage for production data paths.

### FR-9: Input Validation & Error Handling
- Backend validates:
  - Required fields on create/update/comment.
  - Enum values for **priority** and **status**.
  - Foreign keys: `assignedTo`, `createdBy`, `ticketId` reference valid seeded users/tickets.
  - State machine rules on status change.
- Frontend displays meaningful error states (validation errors, not found, server errors, invalid transitions).

### FR-10: Search & Filter (Mandatory Capability)
- At least one search/filter capability is required; Core specifies **both**:
  - Keyword search.
  - Status filter.
- Both must work against persisted data via the backend (not client-only filtering of a partial dataset).

### FR-11: Testing (Mandatory Tier)
- **Integration tests** that prove state-machine behavior:
  - Valid transitions succeed.
  - Invalid transitions are rejected.
- Tests run as part of the project test suite (documented in README).

### FR-12: Submission Artifacts (Non-Code but Required for Completion)
- README with local setup instructions.
- Database setup/migration scripts and seed data.
- Environment variable example (if applicable).
- Full prompt history and lifecycle artifacts in the repository.
- No secrets committed.

---

## 2. Non-Functional Requirements

### NFR-1: Architecture
- Three-tier: **frontend**, **backend API**, **database**.
- Clear separation between UI, API, and persistence layers.

### NFR-2: Database
- Mandatory relational or document store (PostgreSQL, MySQL, MongoDB, SQLite, H2, etc.).
- Schema/migration/initialization scripts provided.
- Seed data for users (and optionally sample tickets/comments).

### NFR-3: Security (Core Scope)
- No authentication required for Core.
- **No secrets** (passwords, API keys, connection strings with real credentials) in the repository.
- Use `.env.example` for configuration placeholders.

### NFR-4: Reliability
- Data consistency: failed writes do not leave partial/invalid records.
- Status transitions should be atomic (validate + update in one logical operation).

### NFR-5: Usability
- UI supports the full Core workflow without requiring API tools.
- Error messages are human-readable (e.g. “Cannot transition from Closed to In Progress”).
- Loading and empty states where appropriate (empty ticket list, no comments yet).

### NFR-6: Maintainability
- Code follows consistent project conventions.
- README enables a new developer to run DB, backend, frontend, and tests locally.

### NFR-7: Testability
- State machine logic is testable via integration tests against the API (or service + DB).
- Test database strategy documented (separate test DB, in-memory SQLite, or transactions).

### NFR-8: Traceability (Assessment-Specific)
- Requirements, design, tasks, acceptance criteria, and prompt history live in the repo (e.g. `tool-specific/cursor-workflow/` for Cursor).
- Implementation traceable from spec to code to tests.

### NFR-9: Performance (Implicit, Core-Level)
- Responsive for small internal datasets; no pagination required in Core.
- Search/filter acceptable with simple DB queries (LIKE/ILIKE, indexed status column).

### NFR-10: Portability
- Runs locally per README; no deployment required for submission.

---

## 3. Database Entities

### Entity: `User` (seeded)
| Field   | Type        | Constraints                          |
|---------|-------------|--------------------------------------|
| id      | PK          | Auto-generated (UUID or serial)      |
| name    | string      | NOT NULL                             |
| email   | string      | NOT NULL, UNIQUE                     |
| role    | string/enum | NOT NULL (e.g. agent, admin — informational only in Core) |

**Notes:** No CRUD UI. Read-only consumption for assignee/creator references.

---

### Entity: `Ticket`
| Field       | Type        | Constraints                                      |
|-------------|-------------|--------------------------------------------------|
| id          | PK          | Auto-generated                                   |
| title       | string      | NOT NULL, max length enforced                      |
| description | text        | NOT NULL                                         |
| priority    | enum/string | NOT NULL (define set: e.g. Low, Medium, High, Critical) |
| status      | enum/string | NOT NULL, default `Open`                         |
| assignedTo  | FK → User   | NULLABLE or NOT NULL (decide; reassignment implies nullable or required) |
| createdBy   | FK → User   | NOT NULL                                         |
| createdAt   | timestamp   | NOT NULL, set on create                          |
| updatedAt   | timestamp   | NOT NULL, updated on modify                      |

**Indexes (recommended):** `status`, `assignedTo`, `createdAt`; full-text or LIKE-friendly index on `title`/`description` if needed for search.

---

### Entity: `Comment`
| Field     | Type        | Constraints                |
|-----------|-------------|----------------------------|
| id        | PK          | Auto-generated             |
| ticketId  | FK → Ticket | NOT NULL, ON DELETE CASCADE (recommended) |
| message   | text        | NOT NULL                   |
| createdBy | FK → User   | NOT NULL                   |
| createdAt | timestamp   | NOT NULL, set on create    |

**Indexes (recommended):** `ticketId`, `createdAt`.

---

### Relationships
```
User 1──* Ticket (createdBy)
User 1──* Ticket (assignedTo)
Ticket 1──* Comment
User 1──* Comment (createdBy)
```

---

### Suggested Enum Values (Not in spec — define explicitly in design)
- **Status:** `Open`, `In Progress`, `Resolved`, `Closed`, `Cancelled`
- **Priority:** `Low`, `Medium`, `High`, `Critical` (or similar fixed set)

---

## 4. REST APIs Required

Base path example: `/api/v1` (exact prefix is an implementation choice).

### Users (read-only, for seeded data)
| Method | Endpoint        | Purpose                                      |
|--------|-----------------|----------------------------------------------|
| GET    | `/users`        | List seeded users (assignee/creator dropdowns) |
| GET    | `/users/:id`    | Optional: get single user                    |

---

### Tickets
| Method | Endpoint                    | Purpose |
|--------|-----------------------------|---------|
| GET    | `/tickets`                  | List tickets. Query params: `search` (keyword), `status` (filter). Returns summary fields. |
| POST   | `/tickets`                  | Create ticket. Body: `title`, `description`, `priority`, `assignedTo?`, `createdBy`. Status defaults to `Open`. |
| GET    | `/tickets/:id`              | Ticket detail including comments (and optionally nested user info). |
| PATCH  | `/tickets/:id`              | Update `title`, `description`, `priority`, `assignedTo`. Must **not** change `status`. |
| PATCH  | `/tickets/:id/status`       | Status transition only. Body: `{ "status": "In Progress" }`. Enforces state machine. |

**Alternative:** Single `PATCH /tickets/:id` with status in body is acceptable if status changes go through the same validation path; a dedicated status endpoint keeps concerns clearer for tests.

---

### Comments
| Method | Endpoint                      | Purpose |
|--------|-------------------------------|---------|
| POST   | `/tickets/:id/comments`       | Add comment. Body: `message`, `createdBy`. |
| GET    | `/tickets/:id/comments`       | Optional if comments are always embedded in `GET /tickets/:id`. |

---

### Standard Error Responses
| Code | When |
|------|------|
| 400  | Validation failure, invalid enum, invalid state transition |
| 404  | Ticket/user not found |
| 500  | Unexpected server error |

**Error body shape (recommended):**
```json
{
  "error": "Invalid status transition",
  "message": "Cannot transition from 'Closed' to 'In Progress'",
  "code": "INVALID_STATUS_TRANSITION"
}
```

---

### API Behaviors to Specify in Design
- **Search:** case-insensitive match on `title` and/or `description`.
- **Filter:** exact match on `status`; omit param for all statuses.
- **List response:** include enough fields for the list UI without N+1 user fetches (e.g. embed assignee name).
- **Status update:** return updated ticket or 400 with reason; never partially apply invalid transitions.

---

## 5. Folder Structure

Technology-agnostic layout aligned with assessment artifact requirements and a typical React + Node.js stack:

```
ticket-management-system/
├── README.md                          # Setup, run, test instructions
├── .env.example                       # DB URL, ports (no secrets)
├── .gitignore
│
├── docs/                              # Or tool-specific/cursor-workflow/
│   ├── requirement-analysis.md        # This document
│   ├── design.md                      # Schema, API contracts, state machine
│   ├── acceptance-criteria.md
│   └── tool-workflow.md               # Part A AI workflow doc
│
├── tool-specific/
│   └── cursor-workflow/               # If using Cursor (per assessment)
│       ├── project-context.md
│       ├── spec.md
│       ├── tasks.md
│       ├── acceptance-criteria.md
│       └── cursor-rules-or-instructions.md
│
├── prompt-history/                    # Full prompt history (required)
│   └── ...
│
├── database/
│   ├── migrations/                    # Schema creation/alter scripts
│   │   └── 001_initial_schema.sql
│   └── seeds/
│       └── seed_users.sql             # Users + optional sample tickets/comments
│
├── backend/
│   ├── package.json / pom.xml / etc.
│   ├── src/
│   │   ├── config/                    # DB, env loading
│   │   ├── models/                    # ORM models / entities
│   │   ├── routes/                    # HTTP route definitions
│   │   ├── controllers/               # Request handlers
│   │   ├── services/                  # Business logic (state machine here)
│   │   ├── validators/                # Input validation schemas
│   │   ├── middleware/                # Error handler, request logging
│   │   └── app.js / server.ts         # Entry point
│   └── tests/
│       └── integration/
│           └── ticket-status-machine.test.js   # Mandatory tier
│
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── api/                       # API client functions
│   │   ├── components/                # Reusable UI (TicketList, TicketForm, etc.)
│   │   ├── pages/                     # List, Detail, Create views
│   │   ├── hooks/                     # Data fetching hooks (optional)
│   │   ├── types/                     # Shared TS types / constants
│   │   ├── utils/                     # Status transition helpers for UI
│   │   └── App.jsx / main.tsx
│   └── public/
│
└── reflections/                       # Part C artifacts
    └── submission-notes.md
```

**Layer responsibilities:**
- `services/` — state machine rules (single source of truth, shared with tests).
- `validators/` — request payload validation.
- `frontend/utils/` — UI may disable invalid transition buttons, but backend remains authoritative.

---

## 6. Acceptance Criteria

Mapped directly to assessment Core criteria plus supporting technical gates:

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-1 | User can **create a ticket** via UI | Create form submits; ticket appears in DB and list |
| AC-2 | User can **view all tickets** from DB | List loads from API; restart app — data still present |
| AC-3 | User can open **ticket detail view** | Detail shows all ticket fields and comments |
| AC-4 | User can **update fields and reassign** | Title, description, priority, assignee update persists |
| AC-5 | User can **add comments** | Comment appears on detail view and in DB |
| AC-6 | **Status changes only via valid transitions** | Each allowed edge works; disallowed returns backend error + UI message |
| AC-7 | **Keyword search and status filter** work | Combined and independent queries return correct subsets |
| AC-8 | **Data survives restart** | Stop/start DB and app; records unchanged |
| AC-9 | **Backend validation** blocks invalid records | Empty title, bad enum, invalid FK, invalid transition all rejected |
| AC-10 | **No secrets in repo** | `.env` gitignored; only `.env.example` with placeholders |
| AC-11 | **State-machine integration tests pass** | CI/local `npm test` (or equivalent) green |
| AC-12 | README enables full local setup | Fresh clone → migrate → seed → run BE + FE → app works |
| AC-13 | Meaningful **UI error states** | Network failure, 400 validation, invalid transition shown to user |
| AC-14 | **Seeded users** available without user CRUD UI | Assignee/creator selectable or defaulted from seed data |

### State Machine Test Matrix (for AC-6 / AC-11)

**Must succeed:**
- Open → In Progress
- In Progress → Resolved
- Resolved → Closed
- Open → Cancelled
- In Progress → Cancelled

**Must fail (examples):**
- Open → Resolved
- Open → Closed
- In Progress → Open
- Resolved → In Progress
- Closed → *
- Cancelled → *
- Resolved → Cancelled

---

## 7. Suggested Implementation Order

### Phase 1: Foundation & Design Artifacts
1. Finalize enums (status, priority), error response format, and API contract.
2. Choose stack and database (SQLite/PostgreSQL are common for local dev).
3. Create repo structure, README skeleton, `.env.example`, `.gitignore`.
4. Write `design.md` with ERD, state machine diagram, and API spec.

### Phase 2: Database Layer
5. Write migration scripts for `User`, `Ticket`, `Comment`.
6. Write seed script for users (3–5 users with varied roles).
7. Verify migrate + seed runs cleanly from README steps.

### Phase 3: Backend Core (No UI Yet)
8. DB connection and models/entities.
9. `GET /users` (read-only).
10. `POST /tickets`, `GET /tickets`, `GET /tickets/:id`.
11. Input validation middleware and centralized error handler.
12. `PATCH /tickets/:id` for field updates.
13. **State machine service** + `PATCH /tickets/:id/status`.
14. `POST /tickets/:id/comments` (+ embed comments in detail).
15. Search (`search` query param) and status filter on `GET /tickets`.

### Phase 4: State Machine Tests (Mandatory Before UI Polish)
16. Integration test setup (test DB or isolated schema).
17. Tests for all **valid** transitions.
18. Tests for representative **invalid** transitions.
19. Fix any backend gaps exposed by tests.

### Phase 5: Frontend
20. API client layer and shared types/constants (statuses, priorities).
21. Ticket list page with search box and status filter.
22. Create ticket form with validation error display.
23. Ticket detail page (fields + comment thread).
24. Edit ticket form (fields + assignee dropdown from seeded users).
25. Status change control (only valid next states enabled; show API errors).
26. Add comment form.
27. Loading, empty, and error UI states.

### Phase 6: End-to-End Verification
28. Manual walkthrough against all acceptance criteria.
29. Restart persistence check.
30. Confirm no secrets committed.

### Phase 7: Submission Artifacts
31. Complete README (prerequisites, DB setup, seed, run, test).
32. Finalize `tool-workflow.md`, prompt history, reflection, PR description.
33. Populate `tool-specific/cursor-workflow/` (or equivalent) for traceability.

---

## Explicitly Out of Scope (Stretch — Do Not Implement)

- Authentication / JWT / sessions / protected routes
- User CRUD and role management UI
- Filter by priority or assignee; sorting; pagination
- Third entity beyond User, Ticket, Comment
- Unit tests, edge-case test suites beyond state-machine integration tests
- Swagger / OpenAPI documentation
- Docker / CI workflows
- Advanced reusable prompt templates (beyond required submission docs)

---

## Key Design Decisions to Lock Early

| Decision | Recommendation |
|----------|----------------|
| How is `createdBy` chosen without auth? | Simple dropdown of seeded users, or fixed default user in UI |
| Dedicated status endpoint vs combined PATCH? | Dedicated `PATCH .../status` — clearer tests and separation |
| Where does state machine live? | Backend service module; frontend mirrors for UX only |
| Comments in list vs detail only? | Detail only (sufficient for Core) |
| Database choice | SQLite for simplicity, PostgreSQL if team standard |

This analysis is ready to drive `spec.md`, `design.md`, and `tasks.md` without writing application code yet. I can produce those planning documents next if you want.

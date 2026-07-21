# Test Strategy

## Test Scope

This project implements the **mandatory Core test tier**: integration tests that prove the ticket **status state machine** rules.

**Stretch test tiers not implemented:** broad unit test coverage, component tests, E2E browser tests, CI pipeline.

---

## Unit Tests

**Location:** `backend/tests/unit/`

| File | Focus |
|------|-------|
| `ticket-status-machine.test.ts` | `getAllowedTransitions`, `canTransition`, `formatAllowedTransitions` |
| `ticket.validator.test.ts` | Create/update/list/status Zod schemas |
| `comment.validator.test.ts` | Comment create schema |

**Count:** 37 unit tests (no database required).

Run: `cd backend && npm run test:unit`

Pure status-machine logic lives in `backend/src/domain/ticket-status-machine.ts` (shared with the service layer).

---

## API / Integration Tests

**Location:** `backend/tests/integration/ticket-status-machine.test.ts`  
**Runner:** Jest 30 + Supertest  
**Database:** Real PostgreSQL via `DATABASE_URL` (migrations applied in `tests/setup.ts`)

### Setup behavior
1. Load env from `.env.test` (if present) then `.env` via `tests/env.cjs`
2. Run `npx prisma migrate deploy` before tests
3. Create test tickets programmatically; delete in `afterEach`

### Test categories

| Category | Count | Assertions |
|----------|-------|------------|
| Valid transitions | 5 | HTTP 200; DB status updated |
| Invalid transitions | 7 | HTTP 400 `INVALID_STATUS_TRANSITION`; DB unchanged |
| Edge cases | 3 | 404 not found; 400 invalid enum; idempotent same-status |

**Total:** 15 tests

### Valid transitions covered
- `OPEN` → `IN_PROGRESS`
- `IN_PROGRESS` → `RESOLVED`
- `RESOLVED` → `CLOSED`
- `OPEN` → `CANCELLED`
- `IN_PROGRESS` → `CANCELLED`

### Invalid transitions covered (parameterized)
- `OPEN` → `RESOLVED`, `OPEN` → `CLOSED`
- `IN_PROGRESS` → `OPEN`
- `RESOLVED` → `IN_PROGRESS`, `RESOLVED` → `CANCELLED`
- `CLOSED` → `IN_PROGRESS`
- `CANCELLED` → `OPEN`

---

## Edge Case Tests

| Test | Expected |
|------|----------|
| Non-existent ticket ID | 404 `NOT_FOUND` |
| Body `{ "status": "INVALID" }` | 400 `VALIDATION_ERROR` |
| `OPEN` → `OPEN` | 200 (idempotent) |

---

## Tests Not Covered (and why)

| Area | Why not covered |
|------|-----------------|
| Ticket CRUD integration | Out of Task 8 scope; manually verified |
| Comment creation | Manually verified; not mandatory test tier |
| Search/filter query params | Manually verified |
| Frontend components | Stretch / time trade-off for Core |
| Auth / authorization | Not in Core |
| Load/performance | Out of scope |

---

## How to Run

```bash
cd backend
npm test
```

**Prerequisites:**
- `DATABASE_URL` set and database reachable
- Migrations compatible with `prisma migrate deploy`

**Configuration files:**
- `backend/jest.config.cjs`
- `backend/tests/env.cjs`
- `backend/tests/helpers/test-app.ts`
- `backend/tests/helpers/enums.ts` (local enums to avoid Prisma CJS/ESM issues in Jest)

---

## Frontend Verification (manual)

| Check | Command / action |
|-------|------------------|
| Production build | `cd frontend && npm run build` |
| Create ticket | UI at `/tickets/new` |
| Search + filter | UI at `/tickets` |
| Status rejection | Attempt invalid transition in UI |
| Comments | Add comment on detail page |

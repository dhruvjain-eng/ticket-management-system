# Test Results

## Summary

| Metric | Value |
|--------|-------|
| **Unit tests** | 37 passed (`npm run test:unit`) |
| **Integration suite** | `backend/tests/integration/ticket-status-machine.test.ts` |
| **Integration tests** | 15 |
| **Full suite** | `npm test` runs unit + integration |

---

## Run Command

```bash
cd backend
npm test                  # all tests
npm run test:unit         # 37 unit tests (no DB)
npm run test:integration  # 15 integration tests (requires DATABASE_URL)
```

---

## Unit Test Breakdown (37/37)

| Suite | Tests | Status |
|-------|-------|--------|
| `ticket-status-machine.test.ts` | 15 | Pass (verified locally) |
| `ticket.validator.test.ts` | 18 | Pass (verified locally) |
| `comment.validator.test.ts` | 4 | Pass (verified locally) |

---

## Integration Test Breakdown

### Valid transitions (5/5)

| Test | Result |
|------|--------|
| OPEN → IN_PROGRESS | Pass |
| IN_PROGRESS → RESOLVED | Pass |
| RESOLVED → CLOSED | Pass |
| OPEN → CANCELLED | Pass |
| IN_PROGRESS → CANCELLED | Pass |

### Invalid transitions (7/7)

| Test | Result |
|------|--------|
| rejects OPEN → RESOLVED | Pass |
| rejects OPEN → CLOSED | Pass |
| rejects IN_PROGRESS → OPEN | Pass |
| rejects RESOLVED → IN_PROGRESS | Pass |
| rejects RESOLVED → CANCELLED | Pass |
| rejects CLOSED → IN_PROGRESS | Pass |
| rejects CANCELLED → OPEN | Pass |

### Edge cases (3/3)

| Test | Result |
|------|--------|
| returns 404 when ticket does not exist | Pass |
| returns 400 for invalid status enum | Pass |
| allows idempotent OPEN → OPEN transition | Pass |

---

## Frontend Build

```bash
cd frontend
npm run build
```

**Expected:** Successful Next.js production build (verified during development).

---

## Prerequisites for Green Tests

1. PostgreSQL database accessible from `DATABASE_URL` in `backend/.env`
2. Network access to database host (local or hosted)
3. `npx prisma migrate deploy` succeeds (run automatically in test setup)

---

## Notes

- Tests use a **real database**, not mocks — status changes are verified by reading back from Prisma after each request.
- Test-created tickets are deleted in `afterEach` to avoid polluting seed data.
- If tests fail with `P1001: Can't reach database server`, confirm `DATABASE_URL` and network connectivity before re-running.

**Security:** Do not paste real `DATABASE_URL` values into documentation or commit them to the repository.

# Testing Prompts

Curated summaries from [tool-specific/cursor-workflow/prompt-history.md](../tool-specific/cursor-workflow/prompt-history.md).

---

## Entry 1 — Integration tests (Task 8)

**Prompt:** Implement Task 8 — Jest + Supertest integration tests for valid and invalid status transitions. No unit tests. Stop after Task 8.

**AI response summary:** Created `ticket-status-machine.test.ts` with 5 valid + 7 invalid transition tests; setup runs `prisma migrate deploy`; programmatic ticket creation and cleanup.

**Accepted:** Mandatory Core test tier for state machine.

**Changed:** N/A initially.

**Rejected:** Unit tests for services (explicitly excluded in prompt).

**Why:** Task 8 scoped integration tests only.

**Artifact:** `backend/tests/integration/ticket-status-machine.test.ts`

---

## Entry 2 — Edge-case tests (review phase)

**Prompt:** *(Part of assessment review)* — align project with acceptance criteria.

**AI response summary:** Added 3 edge-case tests: 404 not found, invalid status enum (`VALIDATION_ERROR`), idempotent OPEN→OPEN.

**Accepted:** Expanded suite to 15 tests total.

**Changed:** Added `transitionTicketRaw()` helper in test app for invalid enum bodies.

**Rejected:** Broad CRUD integration suite (time/scope).

**Why:** Core mandatory tier is state machine; edge cases strengthen evidence.

---

## Entry 3 — `.env.test.example` discussion

**Prompt:** What is the need for `backend/.env.test.example`? Can I remove it?

**AI response summary:** Optional template for dedicated test DB; tests fall back to `.env`. Safe to remove if unused.

**Accepted:** Removal when only using `.env`.

**Changed:** File removed per user decision.

**Rejected:** Maintaining separate test env file when not needed.

**Why:** Simplicity — single `.env` sufficient for local development.

---

## Test execution

```bash
cd backend && npm test
```

**Expected:** 15 passing tests when `DATABASE_URL` is reachable.

See [test-strategy.md](../test-strategy.md) and [test-results.md](../test-results.md).

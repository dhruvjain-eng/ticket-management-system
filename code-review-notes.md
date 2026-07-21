# Code Review Notes

## AI-Assisted Review Summary

A structured review was requested against the full assessment brief:

> Review the entire project against the assessment. Check: missing requirements, validation, error handling, search, filter, accessibility, responsive UI, code duplication. Only implement missing Core requirements. Do not add Stretch features.

Cursor compared the implementation to `tool-specific/cursor-workflow/spec.md`, `acceptance-criteria.md`, and the official assessment Core checklist.

---

## My Review Observations

### Strengths

| Area | Observation |
|------|-------------|
| State machine | Centralized in `status-transition.service.ts`; integration tests prove rules |
| API design | Consistent envelopes, Zod validation, dedicated status endpoint |
| Frontend architecture | Clear split: hooks (reads) → views (orchestration) → presentational components |
| Error handling | `ApiError` + `ErrorBanner` + centralized backend handler |
| Scope discipline | Stretch features consistently excluded |
| Documentation | Planning artifacts and prompt history maintained under `tool-specific/cursor-workflow/` |

### Gaps found (Core only)

| Gap | Severity |
|-----|----------|
| Missing `GET /users/:id` | Low — spec listed endpoint |
| `/` showed Dashboard instead of redirect to `/tickets` | Medium — spec §7.5 |
| Client-side required-field validation incomplete | Medium — acceptance criteria |
| Accessibility attributes missing on forms/errors/table | Medium — assessment review checklist |
| Integration tests missing 404 / invalid enum / idempotent cases | Low — stronger evidence |
| No `backend/.env.example` | Low — setup documentation |
| Search whitespace not trimmed on frontend | Low — UX edge case |

### Not flagged for implementation (Stretch)

- Authentication and protected routes
- Pagination, priority filter, assignee filter
- Unit tests for all services
- Swagger / Docker / CI
- `GET /health`

---

## Changes Made After Review

See [review-fixes.md](review-fixes.md) for the complete change list.

Highlights:
- Added `GET /api/v1/users/:id`
- Root `/` redirects to `/tickets`; removed Dashboard components
- Added `frontend/src/lib/form-validation.ts` and accessibility attributes
- Added 3 integration edge-case tests (15 total)
- Created `backend/.env.example`
- Updated `README.md` with accurate scope and screenshots

---

## Suggestions Rejected (and why)

| Suggestion | Reason rejected |
|------------|-----------------|
| Add JWT authentication | Stretch — explicitly out of Core scope |
| Add pagination to ticket list | Stretch |
| Add Swagger/OpenAPI | Stretch |
| Re-introduce shared `packages/shared` | User already simplified architecture; assessment does not require monorepo |
| Add Dashboard back at `/` | Conflicts with spec redirect to ticket list |
| Add unit tests for every service | Task 8 scoped integration tests only; time better spent on lifecycle docs |

---

## Duplication Assessment

| Area | Status |
|------|--------|
| Status transition map | Intentionally duplicated: backend (authoritative) + `frontend/src/lib/status-machine.ts` (UX) — documented trade-off |
| DTO types | Duplicated in frontend after monorepo removal — acceptable for two-app layout |
| API error parsing | Single `api-client.ts` — no duplication issue |

---

## Overall Assessment

The Core application is **complete and coherent** after the review pass. Remaining improvements are Stretch-tier or process items (candidate info, submission form answers), not Core blockers.

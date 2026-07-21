# Review Fixes

Changes implemented after the AI-assisted assessment review. **Core gaps only** — no Stretch features added.

---

## Backend

| Fix | Files | Outcome |
|-----|-------|---------|
| Add `GET /api/v1/users/:id` | `user.service.ts`, `user.controller.ts`, `user.routes.ts` | Single user lookup for completeness |
| Add `backend/.env.example` | `backend/.env.example` | Documented env vars without secrets |
| Add integration edge-case tests | `ticket-status-machine.test.ts`, `test-app.ts` | 15 tests total (was 12) |
| Add `transitionTicketRaw()` test helper | `tests/helpers/test-app.ts` | Test invalid enum without type bypass |

### New integration tests
1. 404 when ticket does not exist
2. 400 `VALIDATION_ERROR` for invalid status enum
3. Idempotent `OPEN` → `OPEN` returns 200

---

## Frontend

| Fix | Files | Outcome |
|-----|-------|---------|
| `/` redirects to `/tickets` | `app/page.tsx` | Matches spec §7.5 |
| Remove Dashboard | Deleted `DashboardView.tsx`, `DashboardPanels.tsx` | Avoids non-spec UI |
| Trim search whitespace | `TicketListView.tsx` | Empty search does not send noise |
| Client-side required validation | `lib/form-validation.ts`, form components | Disabled submit + field hints |
| Accessibility | `Input.tsx`, `Textarea.tsx`, `Select.tsx`, `ErrorBanner.tsx`, `TicketTable.tsx` | `aria-*`, `role="alert"`, `scope="col"` |
| Responsive table | `TicketTable.tsx` | `overflow-x-auto` wrapper |
| Error boundary navigation | `app/error.tsx` | Link back to `/tickets` |
| Header nav aligned to spec | `Header.tsx` | Tickets nav only (no Dashboard) |

---

## Documentation

| Fix | Files | Outcome |
|-----|-------|---------|
| Professional README | `README.md` | Setup, env vars, API table, screenshots |
| Screenshot paths | `README.md` | All five images under `docs/screenshots/` |
| Submission lifecycle docs | Root `*.md` files | Assessment artifact set |

---

## Verification After Fixes

| Check | Result |
|-------|--------|
| `cd backend && npm test` | 15/15 passing (with reachable DB) |
| `cd frontend && npm run build` | Build succeeds |
| Manual UI walkthrough | Create, list, search, filter, edit, status, comments |
| No secrets in repo | `.env` gitignored; docs use placeholders only |

---

## Not Fixed (intentional — Stretch)

- Authentication / login
- User CRUD UI
- Pagination and advanced filters
- Swagger, Docker, CI
- `GET /health`
- Broad unit test coverage

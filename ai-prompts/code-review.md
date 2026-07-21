# Code Review Prompts

Curated summaries from [tool-specific/cursor-workflow/prompt-history.md](../tool-specific/cursor-workflow/prompt-history.md).  
Full notes: [code-review-notes.md](../code-review-notes.md) · Fixes: [review-fixes.md](../review-fixes.md).

---

## Entry 1 — Full assessment review

**Prompt:** Review entire project against assessment — missing requirements, validation, error handling, search, filter, accessibility, responsive UI, code duplication. Implement missing **Core only**. No Stretch. Summarize changes before making them.

**AI response summary:** Gap analysis against spec and acceptance criteria; identified missing `GET /users/:id`, dashboard vs redirect, client validation, a11y, extra integration tests, `.env.example`.

**Accepted (Core fixes):**
- `GET /api/v1/users/:id`
- `/` → redirect `/tickets`; remove Dashboard
- Form validation UX + accessibility attributes
- 3 additional integration tests (15 total)
- `backend/.env.example`
- Search whitespace trim

**Changed:** README updated during same pass.

**Rejected:**
- JWT authentication
- Pagination
- Swagger/OpenAPI
- Re-adding Dashboard
- Re-introducing `packages/shared`

**Why:** Explicit instruction to implement Core gaps only; Stretch would inflate scope.

---

## Entry 2 — Frontend architecture Q&A (review-adjacent)

**Prompts:** Loading/error layers; `reload()` benefits; API client vs hook state; loading.tsx vs spinner; mutation hook extraction.

**AI response summary:** Documented separation of concerns and when to refactor.

**Accepted:** Patterns validated as intentional.

**Changed:** N/A (no code).

**Rejected:** Moving all state into API client.

**Why:** Hooks own UI loading semantics; client stays transport-only.

---

## Review outcome

| Check | Result |
|-------|--------|
| Core features | Complete |
| Integration tests | 15/15 (with reachable DB) |
| Frontend build | Passes |
| Stretch features | Correctly excluded |
| Documentation | Lifecycle artifacts added at repo root |

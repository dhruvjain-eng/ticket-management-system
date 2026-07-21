# Design Prompts

Curated summaries from [tool-specific/cursor-workflow/prompt-history.md](../tool-specific/cursor-workflow/prompt-history.md).

---

## Entry 1 — Architecture embedded in spec generation

**Prompt:** *(Part of planning)* Include overall architecture, database schema, API contracts, state machine design, UI page descriptions, error handling strategy.

**AI response summary:** Three-tier diagram; MVC backend; thin pages → views → components on frontend; dedicated `StatusTransitionService`; Zod at API boundary; acting-user pattern instead of auth.

**Accepted:** Separation of `app.ts` / `server.ts`; status machine only in dedicated service; `/api/v1` versioning.

**Changed:** Monorepo layout in spec later simplified (see implementation.md).

**Rejected:** Authentication and protected routes in design.

**Why:** Core scope — no auth required.

---

## Entry 2 — Frontend foundation architecture

**Prompt:** Create Next.js app (App Router, TypeScript, Tailwind); configure folder structure, API client, shared types, layout, error boundary, loading UI. No pages yet. Explain architecture first.

**AI response summary:** Proposed API client + `ApiError`, typed API modules, `AppShell`/`Header`, `app/error.tsx`, `app/loading.tsx`; initially suggested monorepo with `packages/shared`.

**Accepted:** API client pattern, layout shell, error/loading boundaries.

**Changed:** Removed monorepo in follow-up prompt; duplicated minimal types in `frontend/src/types/`.

**Rejected:** `packages/shared` workspace package.

**Why:** Assessment does not require monorepo; two standalone apps are simpler.

---

## Entry 3 — Ticket UI architecture

**Prompt:** Implement Ticket Management UI (list, detail, create, edit, dashboard). Loading/error states, reusable components, business logic outside UI. No comments yet.

**AI response summary:** Thin page → `*View.tsx` → presentational components; hooks for reads; `ActingUserContext`; debounced search.

**Accepted:** Hook + view pattern; `reload()` for post-mutation refresh.

**Changed:** Dashboard removed during review; `/` redirects to `/tickets` per spec.

**Rejected:** Keeping Dashboard as home page.

**Why:** Spec §7.5 routes `/` to ticket list, not dashboard.

---

## Entry 4 — Architecture Q&A (design clarification)

**Prompts:** How are loading/errors handled? Why `reload()` in hooks? Why doesn't API client hold loading state? `app/loading.tsx` vs `LoadingSpinner`? When to extract mutation hooks?

**AI response summary:** Four layers (API client → hooks → views → App Router boundaries); separation of transport vs. UI state; mutation hooks when orchestration repeats.

**Accepted:** Documented patterns; no code changes required.

**Changed:** N/A

**Rejected:** N/A

**Why:** Clarified ownership boundaries before further UI work.

**Related docs:** [design-notes.md](../design-notes.md), [ui-flow.md](../ui-flow.md)

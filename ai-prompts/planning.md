# Planning Prompts

Curated summaries from [tool-specific/cursor-workflow/prompt-history.md](../tool-specific/cursor-workflow/prompt-history.md).  
**Scope:** Core only — Stretch features excluded in every planning prompt.

---

## Entry 1 — Requirement analysis

**Prompt:** Read the assessment document; implement mandatory Core only; produce functional/non-functional requirements, entities, REST APIs, folder structure, acceptance criteria, implementation order. No code.

**AI response summary:** Produced Core-only requirement analysis: ticket CRUD, state machine, comments, search/filter, seeded users, persistence, validation, integration tests. Excluded auth, pagination, Docker.

**Accepted:** Three-tier architecture (Next.js + Express + PostgreSQL); backend-enforced status machine; no auth in Core.

**Changed:** Nothing at planning stage.

**Rejected:** Any Stretch feature suggestions (auth, user CRUD, pagination).

**Why:** Assessment scope explicitly limits work to mandatory Core.

**Artifact:** `tool-specific/cursor-workflow/project-context.md`

---

## Entry 2 — Technical specification

**Prompt:** Generate complete technical spec (architecture, schema, API contracts, validation, folder structure, state machine, UI pages, error handling, testing). Markdown only, no code.

**AI response summary:** Full spec with `/api/v1` base path, error envelopes, Zod rules, Prisma models, state machine map, UI descriptions, integration test strategy.

**Accepted:** API versioning, standard error shape, `app.ts` without `listen()` for Supertest.

**Changed:** Test runner noted as Jest in implementation (spec mentioned Vitest as option).

**Rejected:** Stretch endpoints (health check, auth).

**Why:** Kept spec aligned with Core deliverables only.

**Artifact:** `tool-specific/cursor-workflow/spec.md`

---

## Entry 3 — Task breakdown

**Prompt:** Break project into 15–30 minute tasks with dependencies and categories (Backend, Frontend, Database, Testing). Start from setup, end with README. No code.

**AI response summary:** Phased tasks T-001–T-076 with estimates; backend before frontend; tests after APIs.

**Accepted:** Incremental task-driven implementation plan.

**Changed:** Executed as Tasks 1–8 for backend rather than every granular T-xxx ID.

**Rejected:** N/A

**Why:** Task list provided structure; implementation used numbered task prompts.

**Artifact:** `tool-specific/cursor-workflow/tasks.md`

---

## Entry 4 — Acceptance criteria

**Prompt:** Generate Given/When/Then acceptance criteria for create, list, detail, edit, status, comments, search, filter, validation, error handling.

**AI response summary:** Comprehensive Given/When/Then document for all Core features.

**Accepted:** Full criteria set used for final review pass.

**Changed:** Root [acceptance-criteria.md](../acceptance-criteria.md) added later as submission checklist; detailed version kept in `tool-specific/cursor-workflow/`.

**Rejected:** N/A

**Why:** Two files serve different purposes (checklist vs. detailed scenarios).

**Artifact:** `tool-specific/cursor-workflow/acceptance-criteria.md`

---

## Entry 5 — Cursor project rules

**Prompt:** Generate Cursor rules for TypeScript, Next.js, Express, Prisma, validation, incremental delivery, explain-before-generate.

**AI response summary:** Rules for MVC backend, App Router frontend, validation, error handling, one task per response.

**Accepted:** Used as conventions for all implementation prompts.

**Changed:** N/A

**Rejected:** N/A

**Why:** Rules improved consistency across AI-generated code.

**Artifact:** `tool-specific/cursor-workflow/cursor-rules-or-instructions.md`

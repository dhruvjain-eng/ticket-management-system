# AI Tool Workflow

**Primary AI tool:** Cursor  
**Project:** Support Ticket Management System (Core only)  
**Approach:** Spec-driven development with persistent context documents and incremental task execution.

---

## 1. Primary AI tool used

**Cursor** was used as the primary AI coding assistant for requirement analysis, planning, implementation, testing, debugging, documentation, and final review.

---

## 2. How I provide project context to the tool

Before implementation, planning artifacts were created and stored under `tool-specific/cursor-workflow/`:

| File | Purpose |
|------|---------|
| `project-context.md` | Requirement analysis and scope boundaries |
| `spec.md` | Architecture, API contracts, validation, UI descriptions |
| `tasks.md` | Small, dependency-ordered implementation tasks |
| `acceptance-criteria.md` | Given/When/Then criteria for Core features |
| `cursor-rules-or-instructions.md` | Coding conventions and incremental delivery rules |

For each implementation task, prompts explicitly referenced these documents as the source of truth (e.g. *"Use the planning documents as the source of truth. Implement Task N only."*).

---

## 3. How I use AI for requirement analysis

- Started from the official assessment brief (`JS - AI_Assesment_Project (1).md`).
- Asked Cursor to produce a **Core-only** requirement breakdown (functional/non-functional requirements, entities, APIs, folder structure, acceptance criteria, implementation order).
- Reviewed output for Stretch leakage and corrected scope before coding.
- Output captured in `tool-specific/cursor-workflow/project-context.md` and summarized in [requirements-analysis.md](requirements-analysis.md).

---

## 4. How I use AI for planning and design

- Generated a full technical specification (`spec.md`) covering architecture, schema, API contracts, state machine, UI pages, error handling, and testing strategy.
- Broke work into 15–30 minute tasks with dependencies (`tasks.md`).
- Used AI to draft acceptance criteria in Given/When/Then format.
- Created Cursor rules to enforce incremental delivery (one task per response, explain before generating).

---

## 5. How I use AI for code generation

- Implemented backend Tasks 1–7 and frontend phases **one task at a time** with explicit stop points.
- Requested architecture explanations before file generation.
- Kept changes scoped (e.g. *"Do not implement comments yet"*, *"Stop after Task 5"*).
- Rejected initial monorepo/shared-package approach when it exceeded assessment needs; simplified to `backend/` + `frontend/` only.

---

## 6. How I validate AI-generated code

| Validation step | What I did |
|-----------------|------------|
| Manual API checks | Exercised endpoints with curl/browser after each backend task |
| TypeScript build | `npm run build` on backend and frontend |
| Integration tests | `npm test` in `backend/` (15 status-machine tests) |
| Acceptance review | Full project review against assessment criteria before submission |
| Diff review | Read AI-generated files for scope creep, security issues, and pattern consistency |

I did not accept AI output blindly—several fixes were required after validation (see [debugging-notes.md](debugging-notes.md)).

---

## 7. How I use AI for testing

- Task 8 prompt requested Jest + Supertest integration tests for valid/invalid status transitions only.
- Used AI to diagnose Jest + Prisma 7 ESM failures and iterate on configuration (`esbuild-jest`, `moduleFormat = "esm"`, `tests/env.cjs`).
- Added edge-case tests (404, invalid enum, idempotent transition) during assessment polish.

---

## 8. How I use AI for debugging

- Pasted terminal errors and screenshots into Cursor when issues occurred.
- Examples: `ts-node-dev` + TS 7 incompatibility, Express 5 read-only `req.query`, stale dev server 404s, Prisma `import.meta` under Jest.
- Verified each fix by restarting the server or re-running tests.

Full write-up: [debugging-notes.md](debugging-notes.md)

---

## 9. How I use AI for code review

- Ran a structured review prompt against the full project (missing requirements, validation, error handling, search/filter, accessibility, responsive UI, duplication).
- Limited fixes to **Core gaps only**—no Stretch features added.
- Documented observations and changes in [code-review-notes.md](code-review-notes.md) and [review-fixes.md](review-fixes.md).

---

## 10. What information I avoid sharing unnecessarily with AI tools

- Real database credentials or production connection strings (use `.env.example` placeholders only).
- API keys, tokens, or secrets.
- Personal/customer data beyond synthetic seed content.
- Unrelated proprietary code from other employers.

`.env` and `.env.local` are gitignored; documentation references example values only.

---

## 11. How I would reuse this workflow in a real project

1. **Establish persistent context** — spec, tasks, acceptance criteria, and tool rules in version control.
2. **Work in small tasks** — one vertical slice per AI session with explicit boundaries.
3. **Validate continuously** — tests, builds, and manual checks after each task.
4. **Keep prompt history** — document decisions, rejections, and fixes (`tool-specific/cursor-workflow/prompt-history.md`).
5. **Review before merge** — use AI for gap analysis, then apply human judgment on scope and trade-offs.
6. **Separate Core from Stretch** — deliver a complete, documented Core before optional enhancements.

**Reusable artifacts from this project:** `tool-specific/cursor-workflow/` folder, Cursor rules template, task-driven prompting pattern, and lifecycle documentation set at repository root.

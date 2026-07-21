# Implementation Plan

## Overview

Build the Support Ticket Management System **Core** in dependency order: planning artifacts → backend scaffold → database → APIs → integration tests → frontend foundation → ticket UI → comments → polish and submission docs.

**Estimated Core effort:** 8–12 focused hours (per assessment guide), plus lifecycle documentation.

**Stretch:** Not planned or implemented.

---

## Task Breakdown

| Phase | Task | Category | Status |
|-------|------|----------|--------|
| 0 | Requirement analysis, spec, tasks, acceptance criteria, Cursor rules | Planning | Done |
| 1 | Express + TypeScript MVC scaffold (`app.ts`, `server.ts`) | Backend | Done |
| 2 | Prisma schema (User, Ticket, Comment + enums) | Database | Done |
| 3 | Seed script (5 users, 10 tickets, 15 comments) | Database | Done |
| 4 | Users module — `GET /api/v1/users`, `GET /api/v1/users/:id` | Backend | Done |
| 5 | Ticket CRUD + search/filter | Backend | Done |
| 6 | Status transition service + `PATCH .../status` | Backend | Done |
| 7 | Comments — `POST .../comments`, include in detail | Backend | Done |
| 8 | Jest + Supertest integration tests (state machine) | Testing | Done |
| 9 | Next.js + Tailwind + API client + layout + error/loading | Frontend | Done |
| 9b | Remove monorepo; self-contained frontend types | Frontend | Done |
| 10 | Ticket list, create, detail, edit, status UI | Frontend | Done |
| 11 | Comments UI on ticket detail | Frontend | Done |
| 12 | Assessment review + Core gap fixes | Polish | Done |
| 13 | README, screenshots, submission artifacts | Documentation | Done |

Full granular task list: [tool-specific/cursor-workflow/tasks.md](tool-specific/cursor-workflow/tasks.md)

---

## Milestones

| Milestone | Deliverable | Verification |
|-----------|-------------|--------------|
| M1 – Planning complete | `tool-specific/cursor-workflow/*` | Spec reviewed; Core scope locked |
| M2 – Backend APIs | All `/api/v1` endpoints | Manual API testing |
| M3 – Tests green | 15 integration tests | `cd backend && npm test` |
| M4 – Frontend Core UI | List, create, detail, status, comments | `npm run build` + manual UI walkthrough |
| M5 – Submission ready | README + lifecycle docs + prompt history | Checklist vs assessment guide |

---

## AI Usage Plan

| Phase | AI role | Human role |
|-------|---------|------------|
| Planning | Draft spec, tasks, acceptance criteria | Review scope; reject Stretch |
| Backend | Generate MVC modules per task | Run server; verify endpoints |
| Testing | Generate tests; debug Jest/Prisma config | Confirm assertions match rules |
| Frontend | Scaffold components and hooks | UX review; simplify architecture |
| Review | Gap analysis against assessment | Approve Core-only fixes |
| Documentation | Draft submission artifacts | Fill candidate info; verify accuracy |

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI generates Stretch scope | Wasted time, scope creep | Explicit "Core only" in every prompt |
| Express 5 / Prisma 7 breaking changes | Runtime and test failures | Debug with terminal output; pin versions |
| Over-engineering (monorepo) | Harder review | Removed `packages/shared` early |
| Shallow tests | Weak submission | Integration tests + edge cases |
| Secrets in repo | Security failure | `.gitignore`, `.env.example` only |

---

## Mitigation

- **Incremental tasks** with stop points after each backend task.
- **Persistent spec** referenced in every implementation prompt.
- **Prompt history** captured in `tool-specific/cursor-workflow/prompt-history.md`.
- **Final review** pass before submission documentation.

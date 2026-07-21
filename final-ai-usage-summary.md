# Final AI Usage Summary

**Project:** Support Ticket Management System (Core only)  
**Primary tool:** Cursor  
**Outcome:** Working full-stack application with lifecycle documentation

---

## Scope Decision

| Tier | Status |
|------|--------|
| **Core (mandatory)** | Implemented |
| **Stretch (optional)** | Intentionally excluded |

Excluded Stretch items include authentication, user CRUD UI, pagination, advanced filters, Swagger, Docker, CI, and unit test coverage beyond the mandatory integration tier.

---

## AI Usage by Lifecycle Phase

| Phase | Prompts (approx.) | Key outputs | Human validation |
|-------|-------------------|-------------|------------------|
| Planning | 5 | Spec, tasks, acceptance criteria, Cursor rules | Scope review; Stretch removal |
| Backend setup | 1 | MVC scaffold | Dev server start |
| Database | 2 | Schema + seed | `migrate` + `db:seed` |
| Backend APIs | 4 | Users, tickets, status, comments | curl / browser |
| Debugging | 4 | tsx, Express 5 query, 404, Jest ESM | Re-run server/tests |
| Testing | 2 | Integration suite + edge cases | `npm test` (15/15) |
| Frontend | 4 | Setup, simplify, ticket UI, comments | `npm run build` + manual UI |
| Q&A | 5 | Architecture explanations | No code changes |
| Review & docs | 3 | Gap fixes, README, submission artifacts | Checklist vs guide |

Full chronological log: [tool-specific/cursor-workflow/prompt-history.md](tool-specific/cursor-workflow/prompt-history.md)

---

## Persistent Context Strategy

Cursor development was **spec-driven**:

```
Assessment brief
    → project-context.md (requirements)
    → spec.md (design)
    → tasks.md (incremental work)
    → acceptance-criteria.md (verification)
    → cursor-rules-or-instructions.md (conventions)
    → Implementation (one task per prompt)
```

Every implementation prompt referenced these files as the source of truth.

---

## What Was Accepted vs Changed vs Rejected

| AI suggestion | Decision |
|---------------|----------|
| MVC + Zod + Prisma architecture | **Accepted** |
| `/api/v1` versioning | **Accepted** |
| Monorepo + `packages/shared` | **Rejected** — simplified to two apps |
| `ts-node-dev` for dev | **Changed** → `tsx watch` |
| Write validated query to `req.query` | **Changed** → `res.locals.validated` |
| Dashboard at `/` | **Rejected** — redirect to `/tickets` |
| Stretch auth/pagination | **Rejected** — Core only |

---

## Testing & Debugging Evidence

| Evidence | Location |
|----------|----------|
| Integration tests (15) | `backend/tests/integration/ticket-status-machine.test.ts` |
| Test strategy | [test-strategy.md](test-strategy.md) |
| Test results | [test-results.md](test-results.md) |
| Debugging write-up | [debugging-notes.md](debugging-notes.md) |

---

## Code Review Evidence

| Evidence | Location |
|----------|----------|
| Review observations | [code-review-notes.md](code-review-notes.md) |
| Fixes applied | [review-fixes.md](review-fixes.md) |
| PR-style summary | [pr-description.md](pr-description.md) |

---

## Documentation Delivered

| Artifact | File |
|----------|------|
| Setup & run guide | [README.md](README.md) |
| AI workflow (Part A) | [tool-workflow.md](tool-workflow.md) |
| Requirements | [requirements-analysis.md](requirements-analysis.md) |
| Implementation plan | [implementation-plan.md](implementation-plan.md) |
| Design | [design-notes.md](design-notes.md) |
| API contract | [api-contract.md](api-contract.md) |
| Data model | [data-model.md](data-model.md) |
| UI flow | [ui-flow.md](ui-flow.md) |
| Reflection | [reflection.md](reflection.md) |
| Candidate info | [candidate-info.md](candidate-info.md) |
| Cursor-specific artifacts | `tool-specific/cursor-workflow/` |

---

## Responsible AI Practices

- No real credentials committed or pasted into prompts
- `.env` / `.env.local` gitignored; examples use placeholders
- Reviewed AI-generated code before accepting
- Documented mistakes and corrections in prompt history and debugging notes
- Did not claim Stretch features in documentation

---

## Submission Readiness

| Requirement (assessment guide) | Status |
|------------------------------|--------|
| Frontend application | Done |
| Backend API | Done |
| Database + migrations + seed | Done |
| Input validation + error handling | Done |
| Search/filter | Done |
| Meaningful test tier | Done (integration) |
| README setup | Done |
| Full prompt history | Done (`prompt-history.md`) |
| Lifecycle artifacts | Done (root `*.md` + `tool-specific/cursor-workflow/`) |
| Reflection + PR description | Done |
| No secrets in repo | Verified |

**Manual action before form submission:** Fill in [candidate-info.md](candidate-info.md) (name, role, dates) and complete the online participation form.

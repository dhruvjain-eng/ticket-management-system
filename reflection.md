# Reflection

## What I Built

A **Support Ticket Management System** covering the assessment **Core** scope:

- Full-stack TypeScript app (Express API + Next.js UI + PostgreSQL)
- Ticket CRUD, comments, search, and status filter
- Enforced status state machine with integration test proof
- Seeded users with an "acting user" pattern instead of authentication
- Lifecycle documentation and Cursor workflow artifacts

Stretch features (auth, pagination, Docker, Swagger, etc.) were **intentionally not built**.

---

## How I Used AI (across the lifecycle)

| Phase | How Cursor was used |
|-------|---------------------|
| Requirements | Generated and refined Core-only analysis from assessment brief |
| Design | Produced spec, API contracts, folder structure, state machine design |
| Planning | Task breakdown with dependencies and stop points |
| Implementation | One backend/frontend task per session with explicit boundaries |
| Testing | Generated integration tests; debugged Jest + Prisma 7 ESM issues |
| Debugging | Pasted errors; applied fixes for Express 5 and dev tooling |
| Review | Gap analysis against acceptance criteria; Core-only fixes |
| Documentation | README, submission artifacts, prompt history |

---

## What AI Helped With Most

1. **Boilerplate speed** — MVC scaffold, Prisma schema, Zod validators, Next.js component structure
2. **Spec-driven consistency** — Referencing `spec.md` kept API shapes aligned across layers
3. **Obscure tooling issues** — Express 5 read-only `req.query`, Prisma `import.meta` under Jest
4. **Documentation drafting** — Acceptance criteria, README sections, lifecycle artifact templates

---

## What AI Got Wrong

| Issue | What happened | My response |
|-------|---------------|-------------|
| Monorepo over-engineering | Initial frontend used `packages/shared` workspace | Rejected; simplified to two apps |
| Wrong dev tool | `ts-node-dev` with TS 7 | Replaced with `tsx` after verifying error |
| Express 5 assumption | Wrote to `req.query` directly | Validated with API call; moved to `res.locals` |
| Dashboard at `/` | Built non-spec dashboard first | Removed during review; redirect to `/tickets` |
| First Jest config | babel-jest did not resolve Prisma ESM | Iterated until `esbuild-jest` + `moduleFormat = "esm"` worked |

---

## How I Validated AI Output

- Ran the dev server and exercised endpoints after each backend task
- Ran `npm test` until 15 integration tests passed
- Ran `npm run build` on frontend
- Read generated files for scope creep and security (no hardcoded secrets)
- Compared final state to acceptance criteria in a dedicated review pass

---

## What I Would Improve Next

1. **Unit tests** for `status-transition.service.ts` and validators (Stretch evidence)
2. **Component tests** for forms and status control
3. **`frontend/.env.local.example`** for copy-paste setup
4. **Root `acceptance-criteria.md`** symlink or copy from `tool-specific/cursor-workflow/` for guide parity
5. **`ai-prompts/`** grouped summaries (planning, testing, debugging) in addition to full `prompt-history.md`
6. **CI workflow** to run migrations + tests on push

---

## Reusable Workflow

Artifacts worth reusing on future projects:

| Artifact | Location |
|----------|----------|
| Persistent project context | `tool-specific/cursor-workflow/project-context.md` |
| Technical spec | `tool-specific/cursor-workflow/spec.md` |
| Incremental task list | `tool-specific/cursor-workflow/tasks.md` |
| Cursor rules | `tool-specific/cursor-workflow/cursor-rules-or-instructions.md` |
| Full prompt history | `tool-specific/cursor-workflow/prompt-history.md` |
| AI workflow narrative | [tool-workflow.md](tool-workflow.md) |

**Key habit:** One task per prompt, explicit stop points, validate before moving on, document rejections and fixes.

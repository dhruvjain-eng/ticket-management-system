# Debugging Notes

This document records significant issues encountered during AI-assisted development and how they were resolved. **Core scope only** — no Stretch debugging.

---

## Issue 1: Backend dev server fails to start (`ts-node-dev`)

### Problem
Running `npm run dev` failed with TypeScript 7 / `ts-node-dev` incompatibility (terminal error during Task 1 verification).

### How I Investigated
- Pasted terminal output into Cursor
- Confirmed Node and TypeScript versions in `package.json`

### How AI Helped
- Identified `ts-node-dev` as incompatible with TypeScript 7
- Recommended `tsx watch` as a drop-in dev runner

### What I Validated
- Restarted dev server after dependency/script change
- Confirmed `GET` requests reached Express

### Final Fix
- Updated `backend/package.json`: `"dev": "tsx watch src/server.ts"`
- Added `tsx` as dev dependency

**Files modified:** `backend/package.json`

---

## Issue 2: Users endpoint returned 404

### Problem
After implementing Task 4, `GET /api/v1/users` returned 404 despite route registration appearing correct.

### How I Investigated
- Verified route mounting in `routes/index.ts`
- Checked ESM export style (`export default` vs named exports)
- Restarted dev server

### How AI Helped
- Suggested stale dev server and ESM interop issues
- Recommended named exports for route modules

### What I Validated
- Full server restart
- Successful JSON response with seeded users

### Final Fix
- Named ESM exports for route modules
- Server restart (stale process was serving old code)

**Files modified:** `backend/src/routes/*.ts`, `backend/package.json` (`"type": "module"`)

---

## Issue 3: Ticket list returned `INTERNAL_ERROR` (500)

### Problem
`GET /api/v1/tickets` returned:
```json
{ "error": { "code": "INTERNAL_ERROR", "message": "An unexpected error occurred" } }
```

### How I Investigated
- Traced stack through validation middleware and ticket controller
- Compared Express 4 vs Express 5 `req.query` behavior

### How AI Helped
- Identified Express 5 makes `req.query` **read-only**
- Validation middleware was assigning parsed query back to `req.query`, throwing at runtime

### What I Validated
- Ticket list with and without `search` / `status` query params
- Confirmed 200 responses with ticket array

### Final Fix
- Store validated input in `res.locals.validated`
- Added `getValidated()` utility for controllers

**Files modified:**
- `backend/src/middleware/validate.ts`
- `backend/src/utils/get-validated.ts`
- Ticket controller (read from `getValidated`)

---

## Issue 4: Jest fails with Prisma `import.meta` error

### Problem
`npm test` failed:
```
Cannot use 'import.meta' outside a module
```
Error originated from generated Prisma client under Jest's transform pipeline.

### How I Investigated
- Ran tests with full stack trace
- Reviewed Prisma 7 ESM client generation and Jest module settings
- Iterated on babel-jest, tsx loader, then `esbuild-jest`

### How AI Helped
- Proposed `moduleFormat = "esm"` in `schema.prisma`
- Suggested `esbuild-jest` transformer and CommonJS `tests/env.cjs` for dotenv
- Recommended local test enums to avoid importing generated client in setup

### What I Validated
- `npx prisma generate` after schema change
- Full integration suite — 15 tests passing

### Final Fix
| Change | File |
|--------|------|
| `moduleFormat = "esm"` | `backend/prisma/schema.prisma` |
| `esbuild-jest` transformer | `backend/jest.config.cjs` |
| Dotenv preload | `backend/tests/env.cjs` |
| Local enums | `backend/tests/helpers/enums.ts` |
| ESM Jest flag | `package.json` test script with `NODE_OPTIONS='--experimental-vm-modules'` |

---

## Issue 5: Over-engineered monorepo (process fix, not runtime bug)

### Problem
Initial frontend setup introduced `packages/shared` and root npm workspaces — unnecessary for assessment scope.

### How AI Helped
- User prompt explicitly requested simplification
- AI removed workspace config and duplicated minimal DTO types in `frontend/src/types/`

### Final Fix
- Deleted `packages/shared/` and root workspace `package.json`
- Frontend is fully self-contained

---

## Lessons Learned

1. **Always restart the dev server** after route or export changes during debugging.
2. **Validate framework major-version behavior** (Express 5 read-only query) before blaming business logic.
3. **Test tooling must match Prisma's module format** — budget time for Jest + ESM configuration.
4. **Reject over-engineering early** when assessment scope is explicit.

Prompt history with full interaction context: [tool-specific/cursor-workflow/prompt-history.md](tool-specific/cursor-workflow/prompt-history.md)

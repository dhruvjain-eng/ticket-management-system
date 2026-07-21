# Debugging Prompts

Curated summaries from [tool-specific/cursor-workflow/prompt-history.md](../tool-specific/cursor-workflow/prompt-history.md).  
Full write-up: [debugging-notes.md](../debugging-notes.md).

---

## Entry 1 — `ts-node-dev` failure

**Prompt:** Terminal error when starting dev server — what's the issue? *(User confirmed "yes" to fix.)*

**AI response summary:** `ts-node-dev` incompatible with TypeScript 7; replace with `tsx watch`.

**Accepted:** `tsx` as dev runner.

**Changed:** `backend/package.json` dev script.

**Rejected:** Downgrading TypeScript to keep `ts-node-dev`.

**Why:** `tsx` is maintained and works with current TS.

---

## Entry 2 — Users endpoint 404

**Prompt:** "Something off" — screenshot showed 404 on users endpoint.

**AI response summary:** Stale dev server + ESM export interop; use named exports and restart.

**Accepted:** Named route exports; full server restart.

**Changed:** Route module exports.

**Rejected:** Blaming seed data without verifying server process.

**Why:** Old process was serving outdated route table.

---

## Entry 3 — `INTERNAL_ERROR` on ticket list

**Prompt:** Ticket API returned `{ "code": "INTERNAL_ERROR" }` with terminal log attached.

**AI response summary:** Express 5 makes `req.query` read-only; validation middleware was writing to it.

**Accepted:** Store validated input in `res.locals.validated`; read via `getValidated()`.

**Changed:** `validate.ts`, `get-validated.ts`, controllers.

**Rejected:** Downgrading to Express 4.

**Why:** Minimal fix preserving Express 5.

---

## Entry 4 — Jest + Prisma `import.meta`

**Prompt:** Terminal output — `Cannot use 'import.meta' outside a module` in generated Prisma client (pasted twice).

**AI response summary:** Prisma 7 ESM/CJS mismatch under Jest; iterate config until stable.

**Accepted:**
- `moduleFormat = "esm"` in `schema.prisma`
- `esbuild-jest` transformer
- `tests/env.cjs` for dotenv
- Local enums in `tests/helpers/enums.ts`
- `NODE_OPTIONS='--experimental-vm-modules'`

**Changed:** Jest config, Prisma generator, test setup.

**Rejected:** Mocking Prisma entirely (would weaken integration test value).

**Why:** Real DB integration tests require working Prisma client under Jest.

**Outcome:** 12/12 then 15/15 tests passing.

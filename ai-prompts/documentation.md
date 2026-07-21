# Documentation Prompts

Curated summaries from [tool-specific/cursor-workflow/prompt-history.md](../tool-specific/cursor-workflow/prompt-history.md).

---

## Entry 1 — Professional README

**Prompt:** Generate professional README — overview, architecture, folder structure, setup, env vars, migration, seed, run backend/frontend/tests, screenshot placeholders. Do not exaggerate features.

**AI response summary:** Rewrote README with accurate Core scope, setup commands, API table, acting-user pattern, five screenshot sections.

**Accepted:** README as primary setup guide.

**Changed:** Screenshot placeholders later replaced with actual images in `docs/screenshots/`.

**Rejected:** Claiming Stretch features (auth, pagination, Docker).

**Why:** Honest documentation aligned with implemented scope.

**Artifact:** [README.md](../README.md)

---

## Entry 2 — Lifecycle submission artifacts

**Prompt:** Create submission documentation files (candidate-info, tool-workflow, requirements-analysis, implementation-plan, design-notes, api-contract, data-model, ui-flow, test-strategy, test-results, debugging-notes, code-review-notes, review-fixes, pr-description, reflection, final-ai-usage-summary). Documentation only — no source code changes.

**AI response summary:** Created root lifecycle artifacts from actual implementation, tests, and prompt history.

**Accepted:** Full artifact set at repository root.

**Changed:** N/A

**Rejected:** Modifying backend/frontend source for docs.

**Why:** User constraint — docs only.

---

## Entry 3 — Prompt history document

**Prompt:** Create AI chat history from full Cursor conversation; phased structure; exact prompts in code blocks.

**AI response summary:** Created chronological prompt history with phases, decisions, and outcomes.

**Accepted:** Comprehensive history for reviewers.

**Changed:** File renamed to `prompt-history.md` and moved to `tool-specific/cursor-workflow/`.

**Rejected:** Fabricating conversations not in transcript.

**Why:** Assessment requires honest, traceable AI usage.

**Artifact:** [tool-specific/cursor-workflow/prompt-history.md](../tool-specific/cursor-workflow/prompt-history.md)

---

## Entry 4 — Submission alignment (this pass)

**Prompt:** Apply final repository alignment — root `acceptance-criteria.md`, `ai-prompts/` grouped summaries, cross-reference check. No application source changes.

**AI response summary:** Checklist-style acceptance criteria at root; curated `ai-prompts/` by activity; README cross-references updated.

**Accepted:** Exact structural compliance with assessment guide tree.

**Changed:** README submission section only (cross-references).

**Rejected:** Moving or duplicating full `prompt-history.md` into `ai-prompts/`.

**Why:** Full log stays in `tool-specific/cursor-workflow/`; `ai-prompts/` holds curated summaries per guide.

---

## Documentation map

| Purpose | Location |
|---------|----------|
| Setup & run | [README.md](../README.md) |
| Submission checklist | [acceptance-criteria.md](../acceptance-criteria.md) |
| Detailed Given/When/Then | [tool-specific/cursor-workflow/acceptance-criteria.md](../tool-specific/cursor-workflow/acceptance-criteria.md) |
| Curated prompts by activity | [ai-prompts/](.) |
| Full chronological prompts | [tool-specific/cursor-workflow/prompt-history.md](../tool-specific/cursor-workflow/prompt-history.md) |
| Cursor planning artifacts | [tool-specific/cursor-workflow/](../tool-specific/cursor-workflow/) |

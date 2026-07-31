# Agent Guidelines & Development Rules

This document provides style constraints and instructions for AI agents working inside this repository.

---

## 1. Database Safety Rules

### 1.1 Maintain Mock DB Fallback
*   Every query pattern added to the application must remain compatible with BOTH PostgreSQL Drizzle queries AND the in-memory mock client ([mock-db.ts](file:///d:/brainwave(x402)/src/db/mock-db.ts)).
*   If you add a new table to [schema.ts](file:///d:/brainwave(x402)/src/db/schema.ts), you **MUST** update [mock-db.ts](file:///d:/brainwave(x402)/src/db/mock-db.ts) to register the table name, field conversions, and relation handlers.
*   Keep SQL raw fragments (e.g. `sql` templates) encapsulated so they don't break the fallback mock executor.

### 1.2 Migration Flow
*   Do NOT perform ad-hoc SQL executions directly on the database.
*   Write tables using Drizzle schema notation in [schema.ts](file:///d:/brainwave(x402)/src/db/schema.ts).
*   Run database migrations using the package script:
    `npm run db:push`

---

## 2. ESM & Import Resolution

*   This project is configured as a native ES Module (`"type": "module"` in `package.json`).
*   **Module Imports**: Next.js automatically resolves alias imports starting with `@/` (e.g. `@/db`).
*   **Script Runs**: If you are writing scratch scripts or utility test runners, run them using `npx tsx <script-path>`.
*   Avoid relative imports of `.ts` files without proper tool support (like `tsx`), as standard Node will throw `ERR_MODULE_NOT_FOUND`.

---

## 3. UI/UX Style Integrity

*   Maintain the high-fidelity **dark mode** design system.
*   Do not inject raw colors; use Tailwind's slate theme combined with indigo/purple accents.
*   Ensure that interactive states (`hover`, `active`, `disabled`) are styled and animated.
*   Always test responsive breakpoint layouts using smaller container mocks.

---

## 4. Documentation Integrity

*   Preserve existing docstrings and comments.
*   When referencing files, **ALWAYS** generate standard Markdown clickable file links with the `file:///` absolute scheme using forward slashes (e.g., `[schema.ts](file:///d:/brainwave(x402)/src/db/schema.ts)`).
*   Do not wrap file names in backticks inside the link text (e.g. use `[filename.ts](url)` instead of `[`filename.ts`](url)`).

# Gmail Manual Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a FinanFlow user scan recent Gmail receipts, review detected movements, and save them without duplicates.

**Architecture:** Google Identity Services grants a short-lived read-only token in browser memory. A Gmail API adapter and pure parser produce candidate metadata. Supabase RLS tables persist candidates and sender preferences; an atomic database function saves an approved candidate into existing income or expense tables.

**Tech Stack:** React, TypeScript, Google Identity Services, Gmail REST API, Supabase Postgres, CSS Modules.

**Spec:** `docs/superpowers/specs/2026-11-03-gmail-import-design.md`

## Global Constraints

- Gmail token never enters localStorage or Supabase.
- Scan only recent mail with a clear maximum and report that scope in UI.
- Do not store full message body.
- Preserve email/password login and existing finance routes.
- New public tables require RLS ownership policies.

## Review Focus

- Ambiguous amount or direction must stay in review, never auto-save.
- Two messages about one payment should remain reviewable as possible duplicates.
- Repeated sync must not create duplicate candidates.
- Saving twice must not create duplicate financial transactions.
- Missing Google client ID must show setup state, not crash.

---

### Task 1: Parsing and Gmail transport

**Files:** `src/utils/gmailParser.ts`, `tests/gmailParser.test.ts`, `src/services/GmailApi.ts`.

- [x] Write failing parser tests and verify red.
- [x] Implement parser and verify green.
- [x] Add Gmail API transport with bounded search, MIME text decoding, and transient OAuth token.
- [x] Verify tests and typecheck.

### Task 2: Persistence and safe approval

**Files:** `supabase/migrations/*gmail*.sql`, `src/types/database.ts`, `src/services/GmailImportService.ts`.

- [x] Add RLS-protected candidate and sender-rule tables to a migration.
- [x] Add an invoker-rights function that locks a pending candidate, inserts the transaction, and marks it saved atomically.
- [ ] Implement typed service methods and verify migration against FinanFlow project only.

### Task 3: Mobile review flow

**Files:** `src/pages/Gmail/*`, `src/pages/Settings/SettingsPage.tsx`, `src/routes/AppRoutes.tsx`, `.env.example`.

- [x] Add connection and manual sync actions with loading/error/empty states.
- [x] Add review sheet to edit amount, type, title, and category; support save, discard, and future auto-save by sender.
- [x] Add Settings entry and protected route.
- [ ] Run build and responsive UI verification.

### Task 4: External setup verification

- [x] Verify Gmail API and OAuth Web client configuration.
- [x] Configure public client ID locally without committing secrets.
- [ ] Exercise one test account end-to-end if OAuth client exists.

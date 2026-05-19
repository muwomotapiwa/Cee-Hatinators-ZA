# AGENTS.md

## Purpose

This file defines how AI agents and human collaborators should work in this project.

The current source of truth is `ARCHITECTURE_AUDIT.md`. Read it before planning or changing implementation.

## Project Direction

Cee Hatinators is continuing as a custom e-commerce platform.

Retain:

- Vite, React, and TypeScript
- Tailwind CSS
- Firebase Auth
- Firestore
- The existing storefront prototype

Future direction, not current implementation unless explicitly scoped:

- Firebase Cloud Functions
- Stripe/payment backend
- Payment webhook
- Firestore product catalogue
- Admin dashboard

## Critical Commerce Rule

The browser must never be the authority for:

- Payments
- Prices
- Stock
- Discounts
- Inventory
- Order payment status

Any implementation that touches these concerns must use a trusted backend boundary. Do not add client-only commerce authority as a shortcut.

## Working Rules

- Inspect before editing.
- Prefer small, scoped changes.
- Do not redesign the app unless a sprint explicitly asks for it.
- Do not add new commerce features outside the active sprint scope.
- Preserve existing storefront work unless it blocks the sprint goal.
- Keep governance docs updated when decisions, risks, or questions change.
- Treat generated folders and dumps as non-source artifacts unless explicitly needed.

## Required First Checks

Before implementation work, run:

```bash
git status
npm run lint
```

If `git status` fails because the folder is not a Git repository, record that in the handoff or final notes. Do not initialize Git unless explicitly asked.

## Current Sprint

Current sprint: Sprint 001 - Foundation Stabilization.

Sprint documents live in:

```text
docs/sprints/sprint-001-foundation-stabilization/
```

Only work within the sprint scope described there.

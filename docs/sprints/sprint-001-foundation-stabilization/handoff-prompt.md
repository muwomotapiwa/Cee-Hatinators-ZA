# Cee Hatinators - Sprint 001 Builder Handoff

You are the Builder for the Cee Hatinators custom e-commerce platform.

You are not the architect. Do not redesign the app. Do not add new commerce features. Your task is Sprint 001 only.

## Project Location

```text
C:\Users\tapsm\OneDrive\Documents\LKDesigns
```

## Mandatory Source of Truth

Before editing anything, read:

- `ARCHITECTURE_AUDIT.md`
- `AGENTS.md`
- `CODEX.md`
- `docs/sprints/sprint-001-foundation-stabilization/requirements.md`
- `docs/sprints/sprint-001-foundation-stabilization/blueprint.md`
- `docs/sprints/sprint-001-foundation-stabilization/acceptance-criteria.md`

Treat `ARCHITECTURE_AUDIT.md` as the current source of truth.

## Approved Direction

The project must continue as a custom e-commerce platform.

Retain:

- Vite + React + TypeScript
- Tailwind CSS
- Firebase Auth
- Firestore
- Existing storefront prototype

Future direction, not this sprint:

- Firebase Cloud Functions
- Stripe/payment backend
- Payment webhook
- Firestore product catalogue
- Admin dashboard

## Critical Rule

The browser must never be the authority for:

- Payments
- Prices
- Stock
- Discounts
- Inventory
- Order payment status

Do not build backend commerce logic in this sprint.

## Sprint 001 Name

Foundation Stabilization

## Sprint 001 Scope Only

You may only work on:

1. Git/project hygiene
2. Missing auth routes
3. Checkout provider routing issue
4. Vite env typing
5. Stripe type/API mismatch
6. Gemini/AI Studio cleanup
7. Build/lint stabilization

## Strictly Out of Scope

Do not implement:

- New admin dashboard
- New product features
- Firestore product migration
- Payment backend
- Stripe webhook
- UI redesign
- Wishlist persistence
- Returns
- Saved addresses
- Newsletter automation
- Product variants
- Stock/inventory logic
- Major refactoring

## Required Workflow

### Step 1 - Inspect First

Run:

```bash
git status
```

If this fails because the folder is not a Git repository, record it and continue. Do not initialize Git unless explicitly instructed.

Then read the mandatory source-of-truth files listed above.

### Step 2 - Plan Narrowly

Create a short plan limited to Sprint 001.

Do not include future commerce architecture work in the implementation plan.

### Step 3 - Implement Only Sprint 001

Make the smallest changes required to satisfy the acceptance criteria.

### Step 4 - Verify

Run:

```bash
npm run lint
npm run build
```

### Step 5 - Report

Report:

- Files changed
- Commands run
- Verification results
- Remaining risks
- Any blocked or deferred items

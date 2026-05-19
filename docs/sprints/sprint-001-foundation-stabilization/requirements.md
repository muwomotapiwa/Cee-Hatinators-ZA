# Sprint 001 Requirements

## Sprint Name

Foundation Stabilization

## Goal

Stabilize the project foundation so future commerce work can proceed safely without redesigning the app or adding new features.

## Mandatory Source of Truth

Before editing implementation files, read:

- `ARCHITECTURE_AUDIT.md`
- `AGENTS.md`
- `CODEX.md`
- This sprint folder

## In Scope

Only the following work is allowed:

1. Git/project hygiene
2. Missing auth routes
3. Checkout provider routing issue
4. Vite env typing
5. Stripe type/API mismatch
6. Gemini/AI Studio cleanup
7. Build/lint stabilization

## Out of Scope

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

## Critical Rule

The browser must never be the authority for:

- Payments
- Prices
- Stock
- Discounts
- Inventory
- Order payment status

Do not build backend commerce logic in this sprint.


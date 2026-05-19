# CODEX.md

## Codex Operating Context

You are working in:

```text
C:\Users\tapsm\OneDrive\Documents\Cee_Hatinators
```

This project is an early custom e-commerce platform for Cee Hatinators. The storefront prototype exists, but architecture and commerce boundaries are still being stabilized.

## Mandatory Source of Truth

Before editing anything, read:

- `ARCHITECTURE_AUDIT.md`
- `AGENTS.md`
- The active sprint folder under `docs/sprints/`

For Sprint 001, read:

- `docs/sprints/sprint-001-foundation-stabilization/requirements.md`
- `docs/sprints/sprint-001-foundation-stabilization/blueprint.md`
- `docs/sprints/sprint-001-foundation-stabilization/acceptance-criteria.md`
- `docs/sprints/sprint-001-foundation-stabilization/handoff-prompt.md`

## Guardrails

- Do not act as architect unless asked.
- Do not redesign the app.
- Do not add new commerce features during stabilization work.
- Do not build backend commerce logic in the browser.
- Do not make the browser authoritative for payments, prices, stock, discounts, inventory, or order payment status.
- Do not delete prototype work unless a sprint explicitly calls for it.

## Preferred Workflow

1. Run `git status`.
2. Read the audit and sprint docs.
3. Inspect the relevant files.
4. Make a short scoped plan.
5. Implement only the approved scope.
6. Run lint/build checks.
7. Report changed files, verification, and any remaining risks.

## Current Known Baseline

- `git status` currently fails because the folder is not a Git repository.
- `npm run lint` currently fails due to Vite env typing and Stripe API/type issues.
- Auth pages exist but are not routed.
- Checkout has a Stripe `Elements` wrapper export that is not used by the router.
- README and env files still contain AI Studio/Gemini leftovers.

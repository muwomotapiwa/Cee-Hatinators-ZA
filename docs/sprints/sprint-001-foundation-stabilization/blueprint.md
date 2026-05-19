# Sprint 001 Blueprint

## Implementation Intent

Sprint 001 should make the existing app navigable and buildable without changing its commerce architecture.

## Workstream 1 - Project Hygiene

- Run `git status`.
- Record if the project is not a Git repository.
- Do not initialize Git unless explicitly asked.
- Do not delete generated files unless explicitly asked.

## Workstream 2 - Auth Routing

- Wire existing `LoginPage` and `RegisterPage` into `src/App.tsx`.
- Preserve existing page components.
- Preserve redirect query behavior already used by the header/login/register pages.

## Workstream 3 - Checkout Provider Routing

- Route `/checkout` through `CheckoutPageWithStripe`.
- Avoid redesigning checkout.
- Avoid adding new payment behavior.

## Workstream 4 - Vite Env Typing

- Add or update Vite env typings so `import.meta.env` compiles.
- Keep env declarations minimal and aligned with currently referenced variables.

## Workstream 5 - Stripe Type/API Mismatch

- Resolve the current TypeScript error around Stripe checkout redirect.
- Keep behavior as close as possible to the existing scaffold.
- Do not implement a payment backend in this sprint.

## Workstream 6 - Gemini/AI Studio Cleanup

- Remove or update misleading AI Studio/Gemini references in project docs/config where safe.
- Do not remove Firebase config or app functionality accidentally.
- Do not introduce new AI features.

## Workstream 7 - Verification

- Run `npm run lint`.
- Run `npm run build`.
- Report remaining warnings or blockers.

## Non-Goals

- No catalogue migration.
- No backend.
- No webhook.
- No admin dashboard.
- No UX redesign.


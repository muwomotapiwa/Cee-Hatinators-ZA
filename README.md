# Cee Hatinators

Custom e-commerce storefront for elegant hatinators, fascinators, bonnets, and occasion accessories.

This project is currently in foundation stabilization. The storefront prototype exists, but production commerce boundaries are not complete yet.

## Start Here

Before changing implementation, read:

- `ARCHITECTURE_AUDIT.md`
- `AGENTS.md`
- `CODEX.md`
- `docs/architecture.md`
- Active sprint docs under `docs/sprints/`

Current sprint:

```text
docs/sprints/sprint-001-foundation-stabilization/
```

## Current Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Firebase Auth
- Firestore
- Stripe client scaffold

## Critical Commerce Rule

The browser must never be the authority for payments, prices, stock, discounts, inventory, or order payment status.

Trusted commerce behavior belongs behind a backend boundary in a future sprint.

## Local Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Project Status

See `ARCHITECTURE_AUDIT.md` for the current state, risks, reusable components, missing e-commerce features, and recommended next steps.

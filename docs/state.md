# State

## Sprint Status

Sprint 001 - Foundation Stabilization is closed and accepted.

Sprint 002 - Architecture and Data Model Alignment is closed and accepted.

Sprint 003 - Client Decision Pack and Implementation Readiness is closed and accepted.

Sprint 004A - Client Decision Review and Scope Lock is a documentation-only sprint. It creates the decision register, proposed MVP scope lock, deferred scope list, client approval checklist, and implementation gate needed before implementation work begins.

No implementation sprint has started yet. Implementation requires approved scope decisions.

## Current App State

The app remains a storefront prototype.

Current frontend capabilities:

- Vite React TypeScript storefront
- Tailwind CSS styling
- Firebase Auth wiring
- Firestore client wiring
- Local cart state
- Product browsing UI
- Checkout UI scaffold
- Stripe client scaffold

Current production gaps:

- No production commerce backend exists yet.
- No Firebase Cloud Functions exist yet.
- No Firestore product migration exists yet.
- No admin dashboard exists yet.
- No payment webhook exists yet.
- No production inventory logic exists yet.

## Current State Management

The app uses React context and local component state.

Providers are mounted in `src/main.tsx`:

- `AuthProvider`
- `SearchProvider`
- `CartProvider`
- `ProductModalProvider`

## Auth State

Defined in:

```text
src/context/AuthContext.tsx
```

Tracks:

- Firebase user
- Loading state
- Admin status

Admin status currently checks `admins/{uid}`.

## Cart State

Defined in:

```text
src/context/CartContext.tsx
```

Tracks:

- Cart items
- Item count
- Total price

Persistence:

- Browser `localStorage`

Known limitations:

- No selected variant identity.
- No stock validation.
- No stale price protection.
- No malformed localStorage recovery.
- Browser totals are display-only and must not become checkout authority.

## Search State

Defined in:

```text
src/context/SearchContext.tsx
```

Tracks:

- Global search query

## Product Modal State

Defined in:

```text
src/context/ProductModalContext.tsx
```

Tracks:

- Selected product for quick-view modal

## Server State

There is no formal server-state library.

Firestore calls are currently made directly in effects and service methods.

Future consideration: add a server-state strategy only when Firestore-backed catalogue/order flows become an active implementation sprint.

## Known Issues Remaining After Sprint 001

- `npm audit` reports 2 vulnerabilities: 1 moderate and 1 high.
- Vite production build emits a large chunk warning.
- Product data still depends heavily on mock data.
- No backend exists for trusted commerce operations.
- No tests exist.
- Product, order, and Firestore rules models remain mismatched pending future implementation.

These are not blockers for Sprint 002 because Sprint 002 is documentation-only.

## Sprint 001 Baseline Note

Git was initialized after Sprint 001 edits had already started.

Commit `8434c30 chore: establish project governance baseline` represents the stabilized Sprint 001 baseline, not the original pre-edit state.

## Sprint 003 Final State

Sprint 003 creates:

- A client-friendly decision pack.
- An implementation readiness matrix.
- Categorized open questions.
- Proposed defaults clearly marked as proposed, not approved.

No application code, Firestore rules, backend functions, payment backend, admin dashboard, product migration, inventory logic, wishlist persistence, returns, saved addresses, newsletter automation, UI redesign, or application feature is included in Sprint 003.

## Sprint 004A Final State

Sprint 004A creates:

- A decision register for core business and architecture choices.
- A proposed MVP scope lock.
- A deferred post-launch scope list.
- A client approval checklist.
- A build readiness gate.

No business decision is marked approved unless explicitly confirmed in existing docs. Current client decisions remain pending approval or proposed, not approved.

No application code, Firestore rules, backend functions, payment backend, admin dashboard, product migration, inventory logic, wishlist persistence, returns, saved addresses, newsletter automation, UI redesign, or application feature is included in Sprint 004A.

# Decisions

## Decision Log

### 2026-05-18 - Continue as Custom E-Commerce

The project will continue as a custom e-commerce platform rather than moving to Shopify or another hosted commerce platform.

Retained stack:

- Vite
- React
- TypeScript
- Tailwind CSS
- Firebase Auth
- Firestore

### 2026-05-18 - Keep Current Vite React Storefront

The existing storefront prototype remains the frontend foundation.

Future work should improve architecture around it rather than replacing it without an explicit architecture decision.

### 2026-05-18 - Keep Firebase Auth and Firestore

Firebase Auth and Firestore remain the planned identity and data platform.

Firestore schema and rules must be aligned in a later implementation sprint after the Sprint 002 data model is approved.

### 2026-05-18 - Use Firebase Cloud Functions as Backend Authority

Firebase Cloud Functions are the preferred future backend/server authority because the project already uses Firebase.

Cloud Functions should own sensitive commerce operations such as price validation, stock validation, discount validation, checkout session creation, payment webhook processing, and admin commerce writes.

### 2026-05-18 - Browser Is Not Commerce Authority

The browser must not be the source of truth for:

- Payments
- Prices
- Stock
- Discounts
- Inventory
- Order payment status

Trusted commerce operations are reserved for backend/server functions.

### 2026-05-18 - Product Migration Must Wait

Firestore product migration must wait until the product, category, collection, variant, image, and inventory model is approved.

Reason:

- The audit found TypeScript, Firestore rules, blueprint, and service payload mismatches.
- Migrating products before model approval would lock in uncertain assumptions.

### 2026-05-18 - Admin Dashboard Must Wait

The admin dashboard must wait until the permissions model is approved.

Reason:

- Admin actions affect catalogue, orders, stock, and payment-adjacent workflows.
- Authorization should be designed before write interfaces exist.

### 2026-05-18 - Payment Implementation Must Wait

Payment implementation must wait until the backend/API boundary is approved.

Reason:

- Payment session creation and payment status transitions must be backend-owned.
- Stripe or another provider must be confirmed before implementation.
- Webhook handling must be designed before production payment state exists.

### 2026-05-18 - Sprint 001 Accepted

Sprint 001 passed:

- `npm run lint`
- `npm run build`

Parked non-blockers:

- `npm audit` reports 2 vulnerabilities: 1 moderate and 1 high.
- Vite production build emits a large chunk warning.

### 2026-05-18 - Sprint 002 Is Documentation-Only

Sprint 002 defines architecture, data model, API boundary, permissions, validation, risks, questions, and future sequencing.

No application code, Firestore rules, Firebase Functions, payment backend, admin dashboard, or feature implementation is included.

### 2026-05-18 - Git Baseline Nuance

Git was initialized after Sprint 001 edits had already started.

Commit `8434c30 chore: establish project governance baseline` represents the stabilized Sprint 001 baseline, not the original pre-edit state.

### 2026-05-18 - Sprint 003 Is Documentation-Only

Sprint 003 creates a client decision pack and implementation readiness matrix.

No application code, Firestore rules, Firebase Functions, payment backend, Stripe webhook, admin dashboard, product migration, inventory logic, wishlist persistence, returns, saved addresses, newsletter automation, UI redesign, or application feature is included.

### 2026-05-18 - Sprint 004A Is Documentation-Only

Sprint 004A creates a client decision review and scope lock pack.

Sprint 004A does not approve client decisions. It translates Sprint 003 proposed defaults and open questions into:

- Decision register
- Proposed MVP scope lock
- Deferred post-launch scope
- Client approval checklist
- Implementation readiness gate

Implementation must wait until required scope decisions are approved by the client/business owner.

### Proposed Defaults - Not Approved

These defaults are recommended starting points for client review. They are proposed, not approved.

- Payment provider: Stripe - Proposed, not approved.
- Checkout style: hosted Stripe Checkout for first launch - Proposed, not approved.
- Product image storage: Firebase Storage for first launch - Proposed, not approved.
- Guest checkout: supported if business wants fewer checkout barriers - Proposed, not approved.
- Stock tracking: per variant when variants exist, otherwise per product - Proposed, not approved.
- Product variant model: base product plus ProductVariant records - Proposed, not approved.
- Admin role source: `admins/{uid}` first, custom claims later - Proposed, not approved.
- Product migration timing: wait until client decisions are locked - Proposed, not approved.
- Returns/refunds: defer customer self-service portal until after launch - Proposed, not approved.
- Email notifications: start with order confirmation and admin new-order email only - Proposed, not approved.

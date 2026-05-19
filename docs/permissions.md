# Permissions

## Role Model

### Guest

Unauthenticated visitor.

Expected permissions:

- Read active public products.
- Read active public categories and collections.
- Maintain local cart state in browser.
- Start guest checkout only if guest checkout is approved.
- Cannot write orders directly in production architecture.
- Cannot write products, categories, users, admins, payments, or inventory.

### Authenticated Customer

Firebase Auth user without admin role.

Expected permissions:

- Read active public products, categories, and collections.
- Read and update own customer profile fields.
- Read own orders.
- Create checkout request through backend function.
- Cancel own order only if business rules allow and order is in cancellable state.
- Cannot update payment state.
- Cannot update product/catalogue data.
- Cannot grant admin permissions.

### Admin

Firebase Auth user with approved admin authorization.

Expected permissions:

- Manage products, categories, collections, and images.
- Read orders.
- Update allowed order fulfillment/workflow status.
- Manage approved admin workflows.
- Cannot bypass payment provider truth for payment status.
- Should not edit raw payment records except through controlled reconciliation/refund workflows.

## Admin Role Strategy

Recommended phased approach:

1. Phase 1: `admins/{uid}` Firestore document for simple admin checks.
2. Phase 2: Add Firebase custom claims for stronger rule checks and faster auth decisions.
3. Phase 3: Keep `admins/{uid}` as admin profile/audit metadata while custom claims carry authorization flags.

Reason:

- `admins/{uid}` matches the current project pattern.
- Custom claims are better for security rules and backend checks once admin workflows become production critical.

## Collection Permission Expectations

### products

Guest:

- Read active products.

Customer:

- Read active products.

Admin:

- Create/update/archive products through backend/admin tools.

Notes:

- Product writes should be backend-validated.
- Hard delete should be avoided when orders may reference products.

### categories

Guest:

- Read active categories.

Customer:

- Read active categories.

Admin:

- Create/update/archive categories through backend/admin tools.

Notes:

- Categories referenced by products should not be hard-deleted.

### collections

Guest:

- Read active collections.

Customer:

- Read active collections.

Admin:

- Create/update/archive collections through backend/admin tools.

Notes:

- Scheduled collection visibility should be backend/query controlled.

### carts

Guest:

- Local browser cart only unless guest persisted carts are approved.

Customer:

- May have a Firestore cart if persisted carts are approved.

Admin:

- No routine cart write access.

Notes:

- Browser cart state is not authoritative.
- Backend must validate cart before checkout.

### orders

Guest:

- No direct Firestore order writes.
- Guest order access requires a future secure token/email flow if guest checkout is approved.

Customer:

- Read own orders.
- Create checkout request through backend.
- Cannot mark orders as paid.

Admin:

- Read/manage order workflow status through approved admin APIs.
- Cannot spoof provider payment state.

### users/customer profiles

Guest:

- No profile access.

Customer:

- Read/update own allowed profile fields.

Admin:

- Read customer profiles for support/admin workflows.
- Update only approved support fields.

### admins

Guest:

- No access.

Customer:

- No access except possibly checking own admin status through safe backend/auth state.

Admin:

- Read admin metadata as needed.
- Only privileged owners/super-admins should grant admin access.

### payments

Guest:

- No direct access.

Customer:

- May see safe payment summary on own order.

Admin:

- May see payment status and provider references needed for support.

Notes:

- Payment records are backend/webhook-owned.
- Payment provider secret data must never be exposed to the frontend.

## Firestore Security Direction

Firestore rules should enforce:

- Public read for active product catalogue data.
- Owner-only customer profile reads/writes.
- Owner-only order reads.
- Admin-only catalogue writes.
- Backend-only or admin-only payment record writes.
- No client-side payment status authority.

Rules should be updated only in a future implementation sprint after the data model is approved.

## Permission Open Questions

- Who are the launch admins?
- Is one admin role enough at launch?
- Should support staff have read-only order/customer access?
- Should custom claims be required before the admin dashboard ships?
- Should guest checkout be supported?


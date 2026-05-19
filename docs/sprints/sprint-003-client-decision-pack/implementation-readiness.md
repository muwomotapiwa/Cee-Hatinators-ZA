# Implementation Readiness Matrix - Sprint 003

This matrix shows whether each implementation area is ready to start. It is based on the Sprint 002 architecture and data model documentation plus the Sprint 003 client decision pack.

| Area | Status | Required Decision | Dependency | Recommended Sprint | Notes |
|---|---|---|---|---|---|
| Product catalogue | Needs Client Decision | Launch product categories, product fields, first product set. | Client catalogue decisions. | Sprint 004A, then 004B | Do not migrate products until model and launch set are approved. |
| Categories | Needs Client Decision | Final category list and whether collections are separate. | Product catalogue decisions. | Sprint 004A, then 004B | Category structure affects navigation and Firestore seed plan. |
| Product variants | Needs Client Decision | Sizes, colors, custom options, variant-specific stock. | Product model approval. | Sprint 004A, then later schema sprint | Wrong variant model would cause expensive rework. |
| Stock/inventory | Needs Client Decision | Per-product, per-variant, or no launch stock tracking. | Variant decision and backend authority. | Sprint 004A, then backend/schema sprint | Browser must never own stock or inventory authority. |
| Cart | Blocked | Cart item shape, price validation approach, guest/account behavior. | Product and variant model approval. | After Sprint 004A | Cart can remain prototype until backend validation is designed. |
| Checkout | Blocked | Guest checkout, required fields, shipping/pickup, payment provider. | Payment, shipping, and backend API decisions. | After Sprint 004A | Checkout must use backend authority before production commerce. |
| Payment provider | Needs Client Decision | Approved provider and checkout style. | Business approval. | Sprint 004A | Stripe is proposed, not approved. |
| Payment webhook | Blocked | Payment provider and order lifecycle. | Backend/API boundary and provider decision. | After payment provider approval | Webhook must be backend-only. |
| Orders | Blocked | Order statuses, custom order flow, fulfillment flow. | Payment, checkout, shipping decisions. | After Sprint 004A | Order payment status must be controlled by backend/webhook. |
| Admin dashboard | Blocked | Admin roles, permissions, allowed launch actions. | Permissions approval and product/order model approval. | After Sprint 004A and schema sprint | No admin implementation should begin until permissions are locked. |
| Product images | Needs Client Decision | Firebase Storage or Cloudinary, upload owner, variant images. | Storage decision. | Sprint 004A, then catalogue sprint | Firebase Storage is proposed, not approved. |
| Shipping | Needs Client Decision | Shipping methods, pickup, fees, international support. | Checkout decisions. | Sprint 004A | Flat fee is proposed for MVP, not approved. |
| Discounts | Deferred | Whether promo codes or sale pricing are needed for launch. | Backend discount validation design. | Post-MVP unless approved for launch | Discounts must be backend-authoritative. |
| Customer accounts | Needs Client Decision | Guest checkout, optional accounts, saved addresses, order history. | Auth and checkout decisions. | Sprint 004A | Optional accounts are proposed, not approved. |
| Testing | Blocked | Critical flows to test and test tooling expectations. | Implementation scope. | First implementation sprint | Current project has no test suite. |
| Deployment | Blocked | Hosting target, env ownership, production Firebase project. | Backend/payment/storage decisions. | Later implementation readiness sprint | Deployment should wait until architecture decisions are approved. |

## Readiness Summary

Sprint 004 should not start schema or backend implementation until the business owner reviews and locks the core decisions. The recommended next sprint is Sprint 004A - Client Decision Review and Scope Lock.

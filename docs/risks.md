# Risks

## Risk Handling Rule

Sprint 002, Sprint 003, and Sprint 004A document risks and mitigations only. They do not implement code, rules, backend functions, admin workflows, or payment logic.

## Scope Lock Bypass Risk

Risk:

- Builders may skip the Sprint 004A scope lock and start implementation from proposed defaults.

Impact:

- Unapproved MVP scope could become embedded in schema, backend contracts, checkout logic, or admin workflows.

Mitigation:

- Treat Sprint 004A as a required gate.
- Do not start schema, backend, payment, or admin implementation until the client approval checklist is complete.

## Implementation Without Approval Risk

Risk:

- Implementation may begin while decisions remain pending client approval.

Impact:

- The project may ship incorrect categories, payment flow, shipping rules, admin permissions, or inventory behavior.

Mitigation:

- Use the decision register to confirm which items are approved, proposed, deferred, or pending.
- Recommend a client decision follow-up sprint if approvals are missing.

## MVP Creep Risk

Risk:

- Nice-to-have features may be pulled into the first implementation scope.

Impact:

- Delayed launch, larger QA burden, and more architecture churn.

Mitigation:

- Keep deferred features in `deferred-scope.md`.
- Require explicit client approval before moving deferred items into MVP.

## Client Approval Ambiguity Risk

Risk:

- Verbal or unclear approval may be mistaken for locked scope.

Impact:

- Builders may disagree about what should be implemented.

Mitigation:

- Record approvals in the decision register before implementation starts.
- Keep proposed defaults labeled as proposed, not approved until confirmed.

## Starting Implementation Before Decisions Risk

Risk:

- Builders may begin product, checkout, admin, or backend implementation before client decisions are locked.

Impact:

- Rework, wrong assumptions, model churn, and unsafe commerce shortcuts.

Mitigation:

- Use Sprint 003 decision pack before any implementation sprint.
- Do not begin product migration, payment backend, or admin dashboard until required decisions are answered.

## Browser Authority Risk

Risk:

- The browser could accidentally become trusted for prices, stock, discounts, inventory, payment state, or order payment status.

Impact:

- Payment spoofing, incorrect totals, overselling, or unauthorized order state changes.

Mitigation:

- Keep sensitive logic in Firebase Cloud Functions.
- Treat browser totals as display-only.
- Use verified payment webhooks for payment state.

## Mock Data Risk

Risk:

- Product, category, wishlist, and account views still rely heavily on mock/static data.

Impact:

- Builders may mistake prototype behavior for production architecture.

Mitigation:

- Label mock data as prototype-only.
- Approve data model before Firestore migration.
- Replace mock data in a controlled future sprint.

## Product Variant Complexity

Risk:

- Fabrics, headwraps, clothing, sizes, colors, lengths, and made-to-order options may need different variant rules.

Impact:

- Incorrect cart identity, bad pricing, impossible stock tracking, or confusing admin workflows.

Mitigation:

- Confirm launch variant requirements with business owner before implementation.
- Model product variants separately from base product records.

## Stock Overselling Risk

Risk:

- Stock may be sold twice if validation and reservation are not backend-controlled.

Impact:

- Customer refunds, support burden, and fulfillment failures.

Mitigation:

- Decide whether stock is tracked per product or variant.
- Use backend validation during checkout.
- Consider inventory movements and reservation strategy.

## Wrong Stock Model Risk

Risk:

- Stock may be modeled per product when the business needs per variant, or vice versa.

Impact:

- Incorrect availability, overselling, and admin confusion.

Mitigation:

- Decide stock granularity before implementation.
- Start with the simplest approved stock model and document deferred inventory features.

## Payment Spoofing Risk

Risk:

- Client-side payment status updates or unverified webhook handling could mark unpaid orders as paid.

Impact:

- Revenue loss and fraudulent fulfillment.

Mitigation:

- Payment status is backend/webhook-owned.
- Verify provider webhook signatures.
- Deduplicate provider events.

## Payment Provider Rework Risk

Risk:

- Implementation may assume Stripe before payment provider approval.

Impact:

- Payment flow and backend contracts may need rework.

Mitigation:

- Treat Stripe as proposed, not approved, until client confirms.
- Keep payment provider abstraction in documentation before coding.

## Firestore Rules Mismatch Risk

Risk:

- TypeScript types, service payloads, blueprint docs, and Firestore rules are not aligned.

Impact:

- Valid app operations may fail, or invalid writes may be allowed.

Mitigation:

- Approve data model first.
- Update TypeScript, services, rules, and tests together in a future sprint.

## Dual Backend Platform Risk

Risk:

- Firebase and Supabase may both exist in the project before a migration plan is approved.

Impact:

- Auth, product data, orders, permissions, and admin workflows could split across two systems and create inconsistent customer or commerce state.

Mitigation:

- Treat Supabase as connected infrastructure only until a backend migration sprint is approved.
- Do not move products, orders, payments, inventory, discounts, or admin writes to Supabase without approved schema and RLS policies.
- Keep direct Postgres connection strings, service role keys, and database passwords out of frontend code.

## Split Auth and Commerce Backend Risk

Risk:

- Supabase now owns the browser session while older Firestore product/order scaffolding still exists.

Impact:

- Checkout/order writes can fail or become inconsistent if Firebase Auth assumptions are reused with Supabase users.

Mitigation:

- Treat the current Supabase auth work as storefront identity and portal authorization only.
- Do not launch checkout/order persistence until the commerce backend boundary is approved and aligned with the chosen auth source.
- Keep prices, stock, discounts, inventory, and payment status outside browser authority.

## No Tests Risk

Risk:

- Current project has no automated tests.

Impact:

- Regressions in routing, checkout, Firestore services, and security rules may go unnoticed.

Mitigation:

- Add focused tests after architecture is approved.
- Prioritize cart validation, auth protection, order payloads, and Firestore rules.

## Admin Permission Risk

Risk:

- Admin dashboard could expose high-risk writes without a mature role model.

Impact:

- Unauthorized catalogue edits, order tampering, or payment-adjacent mistakes.

Mitigation:

- Use phased admin authorization: `admins/{uid}` first, custom claims later.
- Add backend checks and audit metadata.

## Image Storage Decision Risk

Risk:

- Product image workflows may be built before choosing Firebase Storage or Cloudinary.

Impact:

- Rework in upload, transformation, CDN, and admin media workflows.

Mitigation:

- Decide media provider before admin product image implementation.

## Shipping and Tax Uncertainty

Risk:

- Shipping methods, shipping fees, countries, local pickup, and tax rules are not confirmed.

Impact:

- Checkout totals may be incorrect or incomplete.

Mitigation:

- Capture business requirements before implementing checkout backend.
- Keep shipping/tax validation backend-owned.

## Shipping Logic Rework Risk

Risk:

- Shipping fees, pickup, supported countries, or tax requirements may change after checkout implementation starts.

Impact:

- Checkout totals and backend validation may need rework.

Mitigation:

- Lock launch shipping methods and regions before checkout backend work.
- Keep advanced shipping/tax integrations out of MVP unless required.

## Product Customisation Complexity

Risk:

- Made-to-order measurements, fabric custom cuts, and custom options may affect price, fulfillment, and returns.

Impact:

- Model churn and incorrect order records.

Mitigation:

- Confirm customization scope before product migration.
- Treat custom orders as either structured variants or quoted workflows.

## Wrong Product Variant Model Risk

Risk:

- The variant model could be too simple for fabrics, measurements, colors, or made-to-order products.

Impact:

- Cart identity, pricing, order records, and admin workflows may need major rework.

Mitigation:

- Lock launch variant requirements before Firestore schema work.
- Keep custom order/measurement needs explicit in the client decision pack.

## Admin Permissions Too Broad Risk

Risk:

- Early admin tools may give all admins full write access.

Impact:

- Product, order, or payment-adjacent data may be changed accidentally or by the wrong role.

Mitigation:

- Start with a minimal admin role only if the client confirms launch admins.
- Add custom claims and scoped roles before broader team access.

## Order Status Lifecycle Risk

Risk:

- Order, payment, and fulfillment statuses may be mixed into one field.

Impact:

- Confusing admin workflow and unsafe payment state transitions.

Mitigation:

- Separate order status, payment status, and fulfillment status.
- Define allowed transitions before implementation.

## Parked Post-Sprint 001 Issues

- `npm audit` reports 2 vulnerabilities: 1 moderate and 1 high.
- Vite production build emits a large chunk warning.

These are parked for later review and are not blockers for Sprint 002.

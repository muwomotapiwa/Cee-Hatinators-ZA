# Sprint 004A Blueprint - Decision Review and Scope Lock

## Documentation Plan

1. Read the architecture audit, governance docs, Sprint 002 architecture docs, and Sprint 003 decision pack.
2. Confirm no existing docs explicitly approve client decisions.
3. Create a decision register using Sprint 003 questions and proposed defaults.
4. Create a proposed MVP scope lock that separates included, excluded, deferred, and pending items.
5. Create a deferred post-launch scope list for non-MVP features.
6. Create a client approval checklist in simple non-technical language.
7. Create an implementation gate that defines when build work may start.
8. Update shared state, decisions, risks, and questions docs.
9. Validate and commit documentation changes only.

## Decision Register Plan

The decision register records:

- Decision area
- Decision needed
- Options
- Proposed default
- Status
- Required before sprint
- Notes

Statuses must be one of:

- Approved
- Rejected
- Deferred
- Pending client approval
- Proposed, not approved

No item should be marked approved unless existing docs explicitly confirm it.

## MVP Scope Lock Plan

The MVP scope lock groups proposed build scope into:

- Storefront
- Product catalogue
- Product details
- Cart
- Checkout
- Payments
- Orders
- Customer accounts
- Admin
- Images
- Shipping
- Notifications
- Testing/deployment

Each item states whether it is included in MVP and whether that inclusion is proposed, deferred, excluded, or pending approval.

## Deferred Scope Plan

The deferred scope list keeps post-launch ideas out of the first implementation path unless the client explicitly pulls them into MVP.

Deferred items include wishlist persistence, returns portal, saved addresses, newsletter automation, advanced inventory ledger, advanced admin roles, import/export, image approval workflow, analytics, advanced discounts, partial refunds, and multi-country shipping.

## Client Approval Checklist Plan

The approval checklist should be readable by a non-technical business owner.

It should focus on:

- Products
- Payments
- Checkout
- Shipping
- Admin access
- Launch scope
- Deferred features

## Implementation Gate Plan

Implementation may start only when required decisions are approved:

- Payment provider
- Image storage provider
- Product categories
- Product variant/custom order rules
- Stock tracking model
- Checkout account/guest decision
- Shipping method and fees
- Admin users and admin model
- MVP included/deferred scope

Because current decisions remain pending or proposed, the recommended next sprint should be Sprint 005C - Client Decision Follow-Up.

# Validation

## Validation Layers

Validation must be split into three layers:

1. Frontend display validation
2. Backend/server authority validation
3. Firestore rules validation

Frontend validation improves user experience. It is not a security boundary.

Backend/server validation is the commerce authority.

Firestore rules protect direct database access and ownership boundaries.

## Products

Frontend display validation:

- Required fields visible before admin submit.
- Basic image/file presence checks.
- Slug format feedback.

Backend/server authority validation:

- Unique slug.
- Valid category references.
- Valid collection references.
- Valid status transition.
- Valid price format.
- Required image before publishing.
- Admin authorization.

Firestore rules validation:

- Admin-only writes.
- Basic schema guardrails.
- Public read only for active/public catalogue data if rules support status filtering.

## Variants

Frontend display validation:

- Required option fields.
- Quantity and price input formatting.
- SKU format feedback.

Backend/server authority validation:

- Unique SKU where required.
- Variant belongs to existing product.
- Valid option names and values.
- Price is non-negative.
- Stock fields are valid if stock tracking is enabled.

Firestore rules validation:

- Admin-only writes.
- Basic type/field constraints.

## Cart Items

Frontend display validation:

- Quantity is positive.
- Required options are selected.
- Cart can display estimated subtotal.

Backend/server authority validation:

- Product exists and is active.
- Variant exists and is active.
- Quantity is allowed.
- Price is current.
- Stock is available if tracked.
- Promo and shipping rules are applied.

Firestore rules validation:

- If persisted carts are implemented, users can only read/write own carts.

## Stock

Frontend display validation:

- Show stock messages returned from backend or Firestore catalogue.

Backend/server authority validation:

- Check current stock before checkout.
- Decide whether to reserve stock before payment.
- Prevent overselling unless business explicitly allows backorders.
- Create inventory movements if inventory ledger is approved.

Firestore rules validation:

- Prevent direct customer writes to stock fields.
- Admin/backend-only stock updates.

## Discounts and Promos

Frontend display validation:

- Promo code input format.
- Display backend-returned discount result.

Backend/server authority validation:

- Promo exists.
- Promo is active.
- Promo applies to cart/customer/products.
- Promo has not exceeded usage limits.
- Discount amount is calculated server-side.

Firestore rules validation:

- Customers cannot write promo rules.
- Promo usage should be backend-owned.

## Checkout

Frontend display validation:

- Required contact and address fields.
- Supported country selection.
- Display estimated totals.

Backend/server authority validation:

- Validate cart.
- Validate shipping method and cost.
- Validate tax if applicable.
- Create order/payment session.
- Enforce idempotency.

Firestore rules validation:

- Customers cannot write trusted totals or payment state directly.
- Orders should be created through backend once checkout is productionized.

## Orders

Frontend display validation:

- Display allowed customer actions only.
- Show readable status labels.

Backend/server authority validation:

- Generate order number.
- Snapshot validated order items.
- Validate status transitions.
- Keep payment, order, and fulfillment statuses consistent.
- Restrict cancellation/refund transitions.

Firestore rules validation:

- Customers read own orders.
- Admins read/manage allowed fields.
- Payment state is not client-writable.

## Payments

Frontend display validation:

- Show payment provider UI.
- Display safe status from backend.

Backend/server authority validation:

- Create provider checkout session/payment intent.
- Verify webhook signature.
- Deduplicate webhook events.
- Match event to order/payment.
- Update payment status and order status.

Firestore rules validation:

- Payment records are not customer-writable.
- Admin writes to payment records should be tightly restricted or backend-only.

## Admin Actions

Frontend display validation:

- Required admin form fields.
- Prevent obvious invalid submissions.

Backend/server authority validation:

- Verify admin role.
- Validate requested operation.
- Enforce status transitions.
- Record audit metadata.
- Reject unauthorized field mutations.

Firestore rules validation:

- Admin-only access for catalogue writes.
- No self-granting admin privileges.

## Critical Validation Rule

The browser must never be authoritative for:

- Payments
- Prices
- Stock
- Discounts
- Inventory
- Order payment status

Any future implementation must preserve this boundary.


# API

## Purpose

This document defines future Firebase Cloud Functions/API contracts. These APIs are not implemented in Sprint 002.

## API Principles

- Firebase Cloud Functions should be the trusted backend/server authority.
- Callers must be authenticated where required.
- Backend functions must never trust browser-submitted prices, discounts, stock, inventory, or payment status.
- Firestore rules should protect data access, but backend functions should enforce commerce rules.
- API responses should avoid leaking private provider data or admin-only fields.

## validateCart

Purpose:

- Validate cart contents before checkout and return trusted totals.

Caller:

- Storefront checkout flow.

Required auth:

- Optional for guest checkout if approved.
- Required for account checkout.

Input shape:

```json
{
  "items": [
    {
      "productId": "string",
      "variantId": "string",
      "quantity": 1,
      "selectedOptions": {}
    }
  ],
  "promoCode": "string",
  "shippingAddress": {}
}
```

Output shape:

```json
{
  "valid": true,
  "items": [],
  "subtotalMinor": 0,
  "discountMinor": 0,
  "shippingMinor": 0,
  "taxMinor": 0,
  "totalMinor": 0,
  "currency": "GBP",
  "warnings": []
}
```

Backend authority rules:

- Load current product and variant records from Firestore.
- Validate product/variant status.
- Validate stock if stock tracking is enabled.
- Recalculate prices and totals.
- Validate promo eligibility.

Risks:

- Overselling if stock is not reserved.
- Stale cart display if product data changes.

Open questions:

- Should guest checkout be supported?
- Should stock reserve during validation or only during checkout session creation?

## createCheckoutSession

Purpose:

- Create a trusted payment provider checkout session for a validated cart.

Caller:

- Storefront checkout flow.

Required auth:

- Authenticated customer unless guest checkout is approved.

Input shape:

```json
{
  "items": [],
  "shippingAddress": {},
  "billingAddress": {},
  "promoCode": "string",
  "successUrl": "string",
  "cancelUrl": "string"
}
```

Output shape:

```json
{
  "orderId": "string",
  "checkoutUrl": "string",
  "providerSessionId": "string"
}
```

Backend authority rules:

- Re-run cart validation.
- Create an order in `pending_payment` or equivalent status.
- Create payment provider session using backend secret key.
- Store payment session reference.
- Return only a safe redirect URL/session reference.

Risks:

- Duplicate sessions/orders if retry behavior is not idempotent.
- Price mismatch if cart validation and session creation diverge.

Open questions:

- Which payment provider is approved?
- Should order be created before or after payment session creation?

## handleStripeWebhook

Purpose:

- Process verified Stripe webhook events and update payment/order state.

Caller:

- Stripe webhook delivery.

Required auth:

- No Firebase user auth.
- Must verify Stripe webhook signature.

Input shape:

- Raw provider webhook body and signature header.

Output shape:

```json
{
  "received": true
}
```

Backend authority rules:

- Verify webhook signature.
- Deduplicate event IDs.
- Map provider session/payment intent to order.
- Update payment record.
- Update order payment status only after verified provider event.

Risks:

- Payment spoofing if signature is not verified.
- Duplicate processing if idempotency is missing.
- Status mismatch if events arrive out of order.

Open questions:

- Which webhook events are required for launch?
- Are refunds in launch scope?

## getOrder

Purpose:

- Return one order to its owner or admin.

Caller:

- Account page.
- Admin dashboard.

Required auth:

- Customer can read own order.
- Admin can read any order.

Input shape:

```json
{
  "orderId": "string"
}
```

Output shape:

```json
{
  "order": {}
}
```

Backend authority rules:

- Verify ownership or admin permission.
- Hide admin-only/private payment provider details from customers.

Risks:

- Order data leakage across customers.

Open questions:

- Should customers access guest orders by email token?

## listCustomerOrders

Purpose:

- Return a customer's order history.

Caller:

- Account page.

Required auth:

- Authenticated customer.

Input shape:

```json
{
  "limit": 20,
  "cursor": "string"
}
```

Output shape:

```json
{
  "orders": [],
  "nextCursor": "string"
}
```

Backend authority rules:

- Query only orders owned by the authenticated user.
- Paginate results.

Risks:

- Slow queries without correct indexes.
- Data leakage if ownership filter is wrong.

Open questions:

- What order history fields should customers see?

## adminCreateProduct

Purpose:

- Create a new product record.

Caller:

- Future admin dashboard.

Required auth:

- Admin only.

Input shape:

```json
{
  "product": {},
  "variants": [],
  "images": []
}
```

Output shape:

```json
{
  "productId": "string"
}
```

Backend authority rules:

- Verify admin role.
- Validate product schema.
- Validate slug uniqueness.
- Validate variant and image references.
- Write audit metadata.

Risks:

- Bad catalogue data if schema validation is weak.
- Unauthorized product creation if admin check fails.

Open questions:

- Should product creation be direct publish or draft-first?

## adminUpdateProduct

Purpose:

- Update product, variant, image, category, or collection references.

Caller:

- Future admin dashboard.

Required auth:

- Admin only.

Input shape:

```json
{
  "productId": "string",
  "patch": {}
}
```

Output shape:

```json
{
  "productId": "string",
  "updatedAt": "timestamp"
}
```

Backend authority rules:

- Verify admin role.
- Validate allowed fields.
- Prevent invalid status transitions.
- Preserve order history by not mutating old order snapshots.

Risks:

- Breaking active product pages with incomplete edits.
- Price changes affecting stale carts.

Open questions:

- Should price updates invalidate carts?

## adminArchiveProduct

Purpose:

- Soft archive a product without deleting historical references.

Caller:

- Future admin dashboard.

Required auth:

- Admin only.

Input shape:

```json
{
  "productId": "string",
  "reason": "string"
}
```

Output shape:

```json
{
  "productId": "string",
  "status": "archived",
  "archivedAt": "timestamp"
}
```

Backend authority rules:

- Verify admin role.
- Set status to archived.
- Remove from public listings.
- Preserve order references.

Risks:

- Active carts may contain archived products.

Open questions:

- Should archived products remain visible from old order links?

## adminUpdateOrderStatus

Purpose:

- Allow admins to manage fulfillment/order workflow status.

Caller:

- Future admin dashboard.

Required auth:

- Admin only.

Input shape:

```json
{
  "orderId": "string",
  "status": "processing",
  "fulfillmentStatus": "packed",
  "note": "string"
}
```

Output shape:

```json
{
  "orderId": "string",
  "status": "processing",
  "updatedAt": "timestamp"
}
```

Backend authority rules:

- Verify admin role.
- Enforce allowed status transitions.
- Do not allow manual spoofing of payment provider state except approved admin refund/reconciliation actions.
- Write audit trail.

Risks:

- Incorrect fulfillment state if transitions are not constrained.
- Payment/order mismatch if admins can override payment state casually.

Open questions:

- Which order status transitions should admins be allowed to perform?


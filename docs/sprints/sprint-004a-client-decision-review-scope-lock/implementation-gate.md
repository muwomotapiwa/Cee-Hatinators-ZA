# Implementation Gate - Sprint 004A

## Implementation May Start Only When

- Payment provider is approved.
- Image storage provider is approved.
- Product categories are approved.
- Product variant/custom order rules are approved.
- Stock tracking model is approved.
- Checkout account/guest decision is approved.
- Shipping method and fees are approved.
- Admin users and admin model are approved.
- MVP included/deferred scope is approved.

## Current Gate Status

Implementation is not ready to start.

Current Sprint 004A documents show core decisions are still pending client approval or proposed, not approved. No existing source-of-truth document confirms the required business decisions as approved.

## Recommended Next Sprint

Sprint 005C - Client Decision Follow-Up

Reason:

- Required approvals are still missing.
- Product schema, backend boundary, payment, shipping, admin, and MVP scope decisions are not locked.
- Starting Firestore schema or backend work before approval would risk rework and unsafe assumptions.

## Gate Review Checklist

- Decision register has no required items left in pending/proposed state.
- Client approval checklist is complete.
- MVP scope lock is accepted.
- Deferred scope is accepted.
- Critical commerce rule is acknowledged: the browser must never be the authority for payments, prices, stock, discounts, inventory, or order payment status.

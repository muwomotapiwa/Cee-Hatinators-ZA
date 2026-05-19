# Architecture

## Current Stabilized Frontend Architecture

Cee Hatinators is currently a Vite React single-page storefront with TypeScript, Tailwind CSS, Firebase Auth, Firestore client access, local cart state, and a Stripe client scaffold.

Sprint 001 stabilized the foundation:

- `/login` and `/register` routes exist.
- `/checkout` uses the existing Stripe `Elements` provider wrapper.
- Vite env typing exists for referenced `import.meta.env` variables.
- The stale Stripe `redirectToCheckout` type/API mismatch was removed.
- The browser no longer marks mock checkout orders as `paid`.
- `npm run lint` and `npm run build` passed.

The current app remains a storefront prototype. It is not yet a production commerce system.

## Retained Direction

Keep the current frontend stack:

- Vite
- React
- TypeScript
- Tailwind CSS
- Firebase Auth
- Firestore
- Existing storefront prototype

## Target Architecture

The target architecture is a custom e-commerce platform with a clear backend authority boundary.

```text
React storefront
  -> Firebase Auth for identity
  -> Firestore for persisted commerce data
  -> Firebase Cloud Functions for trusted commerce operations
  -> Stripe or approved payment provider for payment collection
  -> Firebase Storage or Cloudinary for product media, pending decision
```

## Backend Boundary

Firebase Cloud Functions should become the trusted backend/server authority for sensitive commerce operations.

Cloud Functions should own:

- Cart validation before checkout
- Product price lookup
- Product availability and stock validation
- Discount and promo validation
- Checkout session creation
- Payment webhook processing
- Order payment state transitions
- Admin product writes
- Admin order status changes

The frontend may request these operations, but it must not be trusted to finalize them.

## Firebase Cloud Functions Future Role

Future Cloud Functions should provide a narrow API layer for:

- `validateCart`
- `createCheckoutSession`
- `handleStripeWebhook`
- `getOrder`
- `listCustomerOrders`
- `adminCreateProduct`
- `adminUpdateProduct`
- `adminArchiveProduct`
- `adminUpdateOrderStatus`

These functions are not implemented in Sprint 002. Sprint 002 only documents their intended contracts.

## Payment Provider Future Role

Stripe is the current payment scaffold, but the approved payment provider should be confirmed before implementation.

The payment provider should own:

- Card/payment method handling
- Hosted checkout or payment elements
- Payment intent/session lifecycle
- Payment confirmation events
- Refund events, if enabled

The app backend should own:

- Creating checkout sessions/payment intents
- Verifying webhook signatures
- Mapping payment events to orders
- Updating Firestore order payment state

## Firestore Future Role

Firestore should store commerce state that the app reads and writes through controlled boundaries.

Likely collections:

- `products`
- `categories`
- `collections`
- `users`
- `carts`, optional
- `orders`
- `payments`
- `admins`
- `inventoryMovements`, optional future collection

Firestore rules should enforce ownership and role boundaries, but they are not a replacement for backend validation of commerce rules.

## Product Image Storage Options

The image storage decision is open.

Options:

- Firebase Storage
- Cloudinary

Firebase Storage benefits:

- Same Firebase project and security model
- Direct integration with Firebase Auth
- Simple upload path for an admin dashboard

Cloudinary benefits:

- Strong image transformation and optimization tools
- CDN-focused media delivery
- Easier responsive image variants

Decision needed before building product media upload workflows.

## Admin Dashboard Future Role

A future custom admin dashboard should be protected by Firebase Auth and an admin authorization model.

Admin dashboard responsibilities may include:

- Product create/update/archive
- Category and collection management
- Product image upload/management
- Order review and fulfillment status updates
- Promo management, if approved
- Customer support views, if approved

Admin dashboard implementation must wait until the permissions model and data model are approved.

## Frontend Responsibilities

The frontend may own:

- Storefront presentation
- Product browsing and filtering UI
- Cart UI and temporary cart state
- Form display validation
- Login/register/account UI
- Checkout form UI
- Calling backend functions
- Displaying backend-returned order/payment status

The frontend may calculate display totals for user feedback, but backend validation must be authoritative before checkout.

## Backend Responsibilities

The backend must own:

- Price authority
- Discount/promo authority
- Stock/inventory authority
- Payment session creation
- Payment status changes
- Order finalization
- Admin writes that affect commerce state
- Webhook processing

## Critical Commerce Rule

The browser must never be the authority for:

- Payments
- Prices
- Stock
- Discounts
- Inventory
- Order payment status

Any implementation that makes the browser authoritative for these areas violates the architecture.

## Future Sprint Sequencing

Recommended sequencing after Sprint 002:

1. Data model approval with business owner.
2. Firestore schema/rules alignment plan.
3. Backend API/Cloud Functions implementation.
4. Product catalogue migration and seeding.
5. Admin dashboard foundation.
6. Payment checkout and webhook implementation.
7. Customer account, order history, wishlist, and post-purchase workflows.
8. Testing and production hardening.

No feature sprint should begin until its required model, permission, and backend boundary decisions are documented.

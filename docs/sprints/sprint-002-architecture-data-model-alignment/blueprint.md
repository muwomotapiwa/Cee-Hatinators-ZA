# Sprint 002 Blueprint

## Documentation Update Plan

1. Read Sprint 001 closeout and architecture audit.
2. Update architecture direction and trust boundary.
3. Define proposed data models and open questions.
4. Define future API/Cloud Functions contracts.
5. Document permissions and validation responsibilities.
6. Update risks, decisions, questions, and project state.
7. Validate with `git status`.
8. Commit documentation-only changes.

## Architecture Sections To Complete

- Current stabilized frontend architecture.
- Target backend boundary.
- Firebase Cloud Functions future role.
- Stripe/payment provider future role.
- Firestore future role.
- Product image storage options.
- Admin dashboard future role.
- Frontend responsibilities.
- Backend responsibilities.
- Critical browser authority rule.
- Future sprint sequencing.

## Data Model Sections To Complete

Models to document:

- Product
- Category
- Collection
- ProductVariant
- ProductImage
- Cart
- CartItem
- Order
- OrderItem
- CustomerProfile
- Address
- AdminUser
- Payment
- InventoryMovement

Each model should include:

- Purpose
- Key fields
- Required fields
- Optional fields
- Relationships
- Validation notes
- Open questions

## API Boundary Sections To Complete

Future functions to document:

- `validateCart`
- `createCheckoutSession`
- `handleStripeWebhook`
- `getOrder`
- `listCustomerOrders`
- `adminCreateProduct`
- `adminUpdateProduct`
- `adminArchiveProduct`
- `adminUpdateOrderStatus`

Each function should include:

- Purpose
- Caller
- Required auth
- Input shape
- Output shape
- Backend authority rules
- Risks
- Open questions

## Permissions and Validation Sections To Complete

Permissions:

- Guest
- Authenticated customer
- Admin
- Admin role strategy
- Collection-level read/write expectations

Validation:

- Frontend display validation
- Backend/server authority validation
- Firestore rules validation
- Product, variant, cart, stock, discount, checkout, order, payment, and admin validation

## Review Checklist

- No files outside `docs/` were edited.
- No application code was edited.
- No Firestore rules were edited.
- No backend was implemented.
- No payment implementation was added.
- No admin dashboard was implemented.
- Open questions were captured.
- `git status` was checked before commit.
- Documentation changes were committed.


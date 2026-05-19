# Open Questions

Sprint 003 organizes open questions by when they must be answered. Sprint 004A maps these questions into a decision register and client approval checklist.

These are business/client decisions, not implementation decisions made by builders. Do not remove open questions unless they are explicitly answered in existing docs.

## Must Answer Before Implementation

### Products and Catalogue

- What product categories are required at launch?
- Are collections required at launch?
- Are products physical only, or will digital/download products ever be expected?
- Will products use public slugs, Firestore document IDs, or both?

### Product Variants and Custom Orders

- Are sizes required at launch?
- Are color variants required at launch?
- Are fabric/custom options required at launch?
- Are made-to-order measurements required at launch?
- Are fabric products sold by yard, meter, fixed pack, or custom cut?
- Can the same product appear in cart multiple times with different custom options?

### Stock and Inventory

- Is stock tracked per product or per variant?
- Are backorders allowed?
- Should stock reserve during checkout, after payment, or during fulfillment?

### Product Images

- Should product images use Firebase Storage or Cloudinary?
- Are multiple images per product required at launch?
- Are variant-specific images required?
- Who uploads product images?

### Payments

- Which payment provider is approved?
- If Stripe is approved, should checkout use hosted Checkout or Payment Elements?
- Are custom orders paid upfront or quoted first?

### Checkout

- Are customer accounts required for checkout, or should guest checkout be supported?
- What customer fields are required at checkout?
- Should the first release support account checkout only, guest checkout only, or both?

### Shipping and Pickup

- Which countries are supported at launch?
- What shipping methods are required?
- Are shipping fees flat, calculated, or manual?
- Is local pickup required?

### Admin Users

- Who will be admin users?
- Is one admin role enough?
- Who can grant admin access?
- Should admin authorization use `admins/{uid}`, custom claims, or both?

## Can Answer During Implementation

### Discounts and Promotions

- Are promo codes required at launch?
- Are promos percentage-based, fixed amount, free shipping, or all of these?
- Should promo codes be managed in the admin dashboard or payment provider?
- Are usage limits required?

### Emails and Notifications

- Are order confirmation emails required?
- Are fulfillment/shipping emails required?
- Who should receive admin order notification emails?
- Which email provider should be used?

### Customer Accounts

- Should wishlist be account-bound or local-first?
- Are saved addresses required at launch?
- What account pages should ship for first public release?

### Order and Fulfillment

- What order statuses should be shown to customers?
- What order statuses should admins manage?
- Is phone number required for delivery?
- Are tax invoices required?

### Testing and Deployment

- What deployment target is preferred?
- Which future sprint should handle automated tests?
- What browsers/devices are required for launch acceptance?

## Can Defer Until After Launch

### Returns and Refunds

- Are returns/refunds required at launch?
- Which products are returnable?
- Are custom/made-to-order products returnable?
- Should customers request returns through the account area?
- Are partial refunds required at launch?

### Advanced Inventory

- Is an inventory movement ledger required at launch or later?
- Who adjusts stock manually?
- Should low-stock alerts be automated?

### Advanced Admin

- Is a support/read-only admin role required?
- Is an audit log UI required?
- Should product imports/exports be supported?

### Advanced Product Media

- Who approves product images before publication?
- Are automated image transformations required?
- Should generated thumbnails be stored or created dynamically?

### Project Cleanup

- Should generated dump files remain locally ignored only, or be deleted from the workspace later?

# Decisions

## Decision Log

### 2026-05-18 - Continue as Custom E-Commerce

The project will continue as a custom e-commerce platform rather than moving to Shopify or another hosted commerce platform.

Retained stack:

- Vite
- React
- TypeScript
- Tailwind CSS
- Firebase Auth
- Firestore

### 2026-05-18 - Keep Current Vite React Storefront

The existing storefront prototype remains the frontend foundation.

Future work should improve architecture around it rather than replacing it without an explicit architecture decision.

### 2026-05-18 - Keep Firebase Auth and Firestore

Firebase Auth and Firestore remain the planned identity and data platform.

Firestore schema and rules must be aligned in a later implementation sprint after the Sprint 002 data model is approved.

### 2026-05-18 - Use Firebase Cloud Functions as Backend Authority

Firebase Cloud Functions are the preferred future backend/server authority because the project already uses Firebase.

Cloud Functions should own sensitive commerce operations such as price validation, stock validation, discount validation, checkout session creation, payment webhook processing, and admin commerce writes.

### 2026-05-18 - Browser Is Not Commerce Authority

The browser must not be the source of truth for:

- Payments
- Prices
- Stock
- Discounts
- Inventory
- Order payment status

Trusted commerce operations are reserved for backend/server functions.

### 2026-05-18 - Product Migration Must Wait

Firestore product migration must wait until the product, category, collection, variant, image, and inventory model is approved.

Reason:

- The audit found TypeScript, Firestore rules, blueprint, and service payload mismatches.
- Migrating products before model approval would lock in uncertain assumptions.

### 2026-05-18 - Admin Dashboard Must Wait

The admin dashboard must wait until the permissions model is approved.

Reason:

- Admin actions affect catalogue, orders, stock, and payment-adjacent workflows.
- Authorization should be designed before write interfaces exist.

### 2026-05-18 - Payment Implementation Must Wait

Payment implementation must wait until the backend/API boundary is approved.

Reason:

- Payment session creation and payment status transitions must be backend-owned.
- Stripe or another provider must be confirmed before implementation.
- Webhook handling must be designed before production payment state exists.

### 2026-05-18 - Sprint 001 Accepted

Sprint 001 passed:

- `npm run lint`
- `npm run build`

Parked non-blockers:

- `npm audit` reports 2 vulnerabilities: 1 moderate and 1 high.
- Vite production build emits a large chunk warning.

### 2026-05-18 - Sprint 002 Is Documentation-Only

Sprint 002 defines architecture, data model, API boundary, permissions, validation, risks, questions, and future sequencing.

No application code, Firestore rules, Firebase Functions, payment backend, admin dashboard, or feature implementation is included.

### 2026-05-18 - Git Baseline Nuance

Git was initialized after Sprint 001 edits had already started.

Commit `8434c30 chore: establish project governance baseline` represents the stabilized Sprint 001 baseline, not the original pre-edit state.

### 2026-05-18 - Sprint 003 Is Documentation-Only

Sprint 003 creates a client decision pack and implementation readiness matrix.

No application code, Firestore rules, Firebase Functions, payment backend, Stripe webhook, admin dashboard, product migration, inventory logic, wishlist persistence, returns, saved addresses, newsletter automation, UI redesign, or application feature is included.

### 2026-05-18 - Sprint 004A Is Documentation-Only

Sprint 004A creates a client decision review and scope lock pack.

Sprint 004A does not approve client decisions. It translates Sprint 003 proposed defaults and open questions into:

- Decision register
- Proposed MVP scope lock
- Deferred post-launch scope
- Client approval checklist
- Implementation readiness gate

Implementation must wait until required scope decisions are approved by the client/business owner.

### 2026-05-23 - Supabase Project Connected as Backend Candidate

A Supabase project has been created for the client site and connected to the frontend through Vite environment variables.

Project URL:

```text
https://cygqlgwvfwwjqnnkbpml.supabase.co
```

This does not yet replace Firebase Auth or Firestore in the application. Any migration from Firebase to Supabase must be handled in an explicit implementation sprint with data model, auth, permissions, and RLS policies approved first.

The Supabase publishable key may be used in the browser client. Database passwords, direct Postgres connection strings, service role keys, and payment secrets must remain server-side only.

The first Supabase page/table mapping is documented in `docs/supabase-page-data-map.md`.

### 2026-05-23 - Supabase Auth Used for Portal and Storefront Session

Supabase Auth is now the active browser session source for the storefront header, login, register, protected account/wishlist routes, and the super user portal gate.

Role checks use `public.profiles.role`:

- `super_user` can see portal links and admin edit screens.
- `general_user` can sign in, create an account, browse, use account routes, and shop.

Firebase/Firestore remain present for older product/order scaffolding and must not be treated as production commerce authority. Checkout, prices, stock, discounts, inventory, and payment state still require a trusted backend boundary before launch.

### 2026-05-23 - Portal Editors Back Supabase Site Tables

The super user portal now exposes Supabase-backed edit screens for:

- Content blocks
- Products
- Categories
- Collections
- Contact messages
- Newsletter subscribers
- Site settings

These screens are gated by `profiles.role = super_user`. Product price fields in the portal are catalog/display data only at this stage and are not approved as checkout/payment authority.

### 2026-05-23 - Storefront Reads Supabase Catalog Display Data

The storefront now reads active Supabase display data for:

- Products
- Categories
- Collections

When Supabase has no active records, the app falls back to the existing mock storefront data so the site does not render empty. Contact form submissions insert into `contact_messages`, and newsletter signups insert into `newsletter_subscribers`.

These records are still display/catalog data. Checkout totals, price authority, stock, inventory, discounts, and payment status remain outside browser authority and need a trusted backend before production commerce launch.

### 2026-05-24 - Product Colours and Styling Notes Are Editable

Product records now include editable display fields for:

- `colors`: optional JSON array of colour hex values shown as product colour swatches when specified.
- `styling_note`: per-product styling guidance shown on product quick view and product detail pages.

If `colors` is empty or null, the storefront does not show colour swatches for that product. These are presentation/catalog fields only. They do not define stock, variant identity, inventory, or checkout authority.

### 2026-05-24 - Product Gallery Thumbnails Are Editable

Product records now include optional `gallery_image_urls`, a JSON array of up to four thumbnail image URLs for product detail pages.

The primary image remains the main product/listing image. Gallery URLs control the small thumbnail strip below the main product image. If no gallery URLs are supplied, no thumbnail strip is shown.

The product `featured` flag now has a visible storefront effect: featured active products sort first in New Headwear before `sort_order`.

### 2026-05-24 - Product Occasions Are Editable

Shop occasion filters now use Supabase catalogue metadata:

- `occasions`: active occasion filter labels, ordering, and status.
- `product_occasions`: many-to-many assignments between hats and occasions.

Super users can manage occasions and assign them to hats in the portal. These fields are public display/filter metadata only and do not define stock, variants, inventory, pricing, discounts, or checkout authority.

### 2026-05-24 - Spotlight Collection Uses Its Own Portal Area

The home Spotlight Collection now reads the first active record from `spotlight_collections`.

This is separate from regular Collections to avoid editing confusion. Editable fields include the small heading, title, description, hero image, up to two detail image URLs, bullet lines, button label, and collection slug for the shop link. If there is no active spotlight record, the storefront hides the section. This remains display/filter metadata only and does not create checkout authority.

### 2026-05-24 - Testimonials Are Editable

The home "What People Say" customer stories section now reads active `testimonials` records. Super users can create, edit, archive, and reorder testimonials in the portal. If there are no active testimonial records, the section is hidden on the storefront. The storefront displays a maximum of six active testimonials, centers partial rows, and shows an optional person image when `image_url` is provided.

### 2026-05-24 - Wishlist Uses Supabase Per User

Signed-in general-user and super-user sessions now use `wishlist_items` for saved products. Users can add or remove hats from product cards, product detail pages, quick-view modals, and the wishlist page.

Wishlist records store the current Supabase auth user and the product slug used by the storefront. The wishlist is a customer convenience feature only and does not create price, stock, discount, inventory, order, or payment authority in the browser.

### 2026-05-24 - South African Rand Is the Base Display Currency

Cee Hatinators is operating in South Africa for now, so the storefront and portal use ZAR as the fixed display currency. Supabase still stores product money in minor units/cents (`base_price_minor`), but the portal product editor now shows normal rand prices such as `1299.99` and converts to cents before saving.

This remains catalogue display data only. Checkout, price validation, discounts, inventory, stock, and payment state still require a trusted backend before production commerce launch.

### 2026-05-24 - Checkout Delivery Methods Are Editable Display Settings

The checkout delivery method labels, descriptions, and ZAR display prices now come from `site_settings.shipping_summary.methods`. Super users can edit these values in Portal Settings.

These values are used by the current browser checkout scaffold only. A production checkout must still recalculate and validate shipping, discounts, totals, payment state, and order status on a trusted backend.

### 2026-05-24 - Collections Page Uses Assigned Products

The Collections page now reads product-level placement fields first. Super users can edit a product, enable it for the Collections page, set the row title/copy/image, and choose whether the image appears on the left or right. Older `collections.featured_product_slug` records remain as a fallback.

Collections without an assigned or matching product are hidden on the public Collections page to avoid dead editorial links.

### 2026-05-24 - Account Page Uses Role-Based Views

Normal customer accounts use the `general_user` role. General users see their own account details, order-history display records, wishlist, saved addresses, track-order view, and return requests.

Users with `profiles.role = 'super_user'` see a customer dashboard view with all profiles, orders, addresses, wishlist rows, and return requests. This does not make the browser authoritative for payment status, prices, stock, discounts, or checkout totals.

### 2026-05-24 - Signed-In Customer Bags Are Visible to Super Users

Signed-in customer bag rows sync to Supabase in `customer_cart_items`. General users can manage their own saved bag rows from the storefront, and super users can view, add, edit, or remove signed-in customer bag rows from the customer dashboard.

This is saved-bag support data only. Anonymous carts remain local-only. Checkout totals, final prices, stock, discounts, inventory, and payment state still require a trusted backend before production commerce launch.

### Proposed Defaults - Not Approved

These defaults are recommended starting points for client review. They are proposed, not approved.

- Payment provider: Stripe - Proposed, not approved.
- Checkout style: hosted Stripe Checkout for first launch - Proposed, not approved.
- Product image storage: Firebase Storage for first launch - Proposed, not approved.
- Guest checkout: supported if business wants fewer checkout barriers - Proposed, not approved.
- Stock tracking: per variant when variants exist, otherwise per product - Proposed, not approved.
- Product variant model: base product plus ProductVariant records - Proposed, not approved.
- Admin role source: `admins/{uid}` first, custom claims later - Proposed, not approved.
- Product migration timing: wait until client decisions are locked - Proposed, not approved.
- Returns/refunds: defer customer self-service portal until after launch - Proposed, not approved.
- Email notifications: start with order confirmation and admin new-order email only - Proposed, not approved.

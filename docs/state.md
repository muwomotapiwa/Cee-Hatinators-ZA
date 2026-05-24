# State

## Sprint Status

Sprint 001 - Foundation Stabilization is closed and accepted.

Sprint 002 - Architecture and Data Model Alignment is closed and accepted.

Sprint 003 - Client Decision Pack and Implementation Readiness is closed and accepted.

Sprint 004A - Client Decision Review and Scope Lock is a documentation-only sprint. It creates the decision register, proposed MVP scope lock, deferred scope list, client approval checklist, and implementation gate needed before implementation work begins.

No implementation sprint has started yet. Implementation requires approved scope decisions.

## Current App State

The app remains a storefront prototype.

Current frontend capabilities:

- Vite React TypeScript storefront
- Tailwind CSS styling
- Supabase Auth wiring for storefront sessions and portal role checks
- Supabase-backed super user portal editors for content, spotlight collection, products, categories, collections, testimonials, messages, newsletter subscribers, and settings
- Supabase-backed storefront display reads for active products, categories, and collections, with mock fallback
- Product colour swatches and styling notes are editable per product in the Supabase portal
- Product detail gallery thumbnails are editable per product with up to four URLs
- Contact form and newsletter submissions write to Supabase tables
- Firebase Auth wiring still present in legacy scaffolding
- Firestore client wiring
- Local cart state
- Product browsing UI
- Checkout UI scaffold
- Stripe client scaffold
- Supabase browser client configuration

Current production gaps:

- No production commerce backend exists yet.
- No Firebase Cloud Functions exist yet.
- No approved Firebase-to-Supabase migration exists yet.
- No Firestore product migration exists yet.
- No admin dashboard exists yet.
- No payment webhook exists yet.
- No production inventory logic exists yet.

## Current State Management

The app uses React context and local component state.

Providers are mounted in `src/main.tsx`:

- `AuthProvider`
- `SearchProvider`
- `CartProvider`
- `ProductModalProvider`

## Auth State

Defined in:

```text
src/context/AuthContext.tsx
```

Tracks:

- Supabase user session
- Supabase `profiles` role
- Loading state
- Super user status

Super user status checks `profiles.role = super_user`. The previous `isAdmin` context value remains as a compatibility alias for older app code.

## Cart State

Defined in:

```text
src/context/CartContext.tsx
```

Tracks:

- Cart items
- Item count
- Total price

Persistence:

- Browser `localStorage`
- Supabase `customer_cart_items` for signed-in users

Known limitations:

- No selected variant identity.
- No stock validation.
- No stale price protection.
- No malformed localStorage recovery.
- Browser totals are display-only and must not become checkout authority.
- Anonymous visitor carts remain local-only and cannot be reviewed by super users.

## Search State

Defined in:

```text
src/context/SearchContext.tsx
```

Tracks:

- Global search query

## Product Modal State

Defined in:

```text
src/context/ProductModalContext.tsx
```

Tracks:

- Selected product for quick-view modal

## Server State

There is no formal server-state library.

Firestore calls are currently made directly in effects and service methods.

Future consideration: add a server-state strategy only when Firestore-backed catalogue/order flows become an active implementation sprint.

## Supabase State

Supabase is configured in:

```text
src/lib/supabase.ts
```

The planned Supabase page/table mapping is documented in:

```text
docs/supabase-page-data-map.md
```

The current browser client uses:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Supabase is now used for browser authentication, portal authorization, editable site settings, contact/newsletter submissions, and storefront display reads for active product/category/collection records.

Supabase product records are live storefront display data, but not trusted checkout authority. Orders, checkout price validation, stock, discounts, inventory, and payment status are not production-backed by Supabase yet. Those commerce changes require an approved implementation sprint and server-side/RLS design.

Product occasion filters now use Supabase display metadata through `occasions` and `product_occasions`. Super users can add occasion filters and assign them to hats in the portal. These records only control storefront filtering and do not represent variants, stock, prices, discounts, or checkout authority.

The home Spotlight Collection now uses its own `spotlight_collections` table and portal area. If no active spotlight record exists, the section is hidden. The shop page understands `?collection=...` links and filters products when product-to-collection assignments exist.

The home customer stories section now reads active `testimonials` records. Super users can edit testimonials in the portal, and the section is hidden when there are no active testimonials. The storefront shows up to six active testimonials, centers partial rows, and can show an optional person image.

Wishlist state now uses Supabase `wishlist_items` records for the signed-in user. Product cards, product detail, quick-view, and the wishlist page can add and remove saved products. Wishlist data remains separate from checkout authority.

The storefront display currency is now fixed to ZAR for South Africa. Product records still store cent values in `base_price_minor`, but the portal product editor displays and accepts normal rand prices before converting them to minor units for Supabase.

Checkout delivery method labels, descriptions, and display prices now read from `site_settings.shipping_summary.methods` and can be edited in Portal Settings. This is still browser display/scaffold behaviour, not trusted production checkout authority.

The Collections page now renders from active products marked for Collections placement, with editable row title, copy, image, and image side. Public Explore links go to that product detail page. Older collection rows still work as a fallback.

The Account page now branches by Supabase role. `general_user` users see their own account details, wishlist, saved bag, saved addresses, order-history display records, track-order view, and return requests. `super_user` users see an all-customer dashboard with profiles, orders, returns, wishlist rows, saved addresses, and signed-in customer bag rows. Account portal SQL lives in `docs/supabase-add-account-portal.sql`; saved-bag SQL lives in `docs/supabase-add-customer-cart-items.sql`.

## Known Issues Remaining After Sprint 001

- `npm audit` reports 2 vulnerabilities: 1 moderate and 1 high.
- Vite production build emits a large chunk warning.
- Product data falls back to mock data when Supabase has no active display records.
- No backend exists for trusted commerce operations.
- No tests exist.
- Product, order, and Firestore rules models remain mismatched pending future implementation.

These are not blockers for Sprint 002 because Sprint 002 is documentation-only.

## Sprint 001 Baseline Note

Git was initialized after Sprint 001 edits had already started.

Commit `8434c30 chore: establish project governance baseline` represents the stabilized Sprint 001 baseline, not the original pre-edit state.

## Sprint 003 Final State

Sprint 003 creates:

- A client-friendly decision pack.
- An implementation readiness matrix.
- Categorized open questions.
- Proposed defaults clearly marked as proposed, not approved.

No application code, Firestore rules, backend functions, payment backend, admin dashboard, product migration, inventory logic, wishlist persistence, returns, saved addresses, newsletter automation, UI redesign, or application feature is included in Sprint 003.

## Sprint 004A Final State

Sprint 004A creates:

- A decision register for core business and architecture choices.
- A proposed MVP scope lock.
- A deferred post-launch scope list.
- A client approval checklist.
- A build readiness gate.

No business decision is marked approved unless explicitly confirmed in existing docs. Current client decisions remain pending approval or proposed, not approved.

No application code, Firestore rules, backend functions, payment backend, admin dashboard, product migration, inventory logic, wishlist persistence, returns, saved addresses, newsletter automation, UI redesign, or application feature is included in Sprint 004A.

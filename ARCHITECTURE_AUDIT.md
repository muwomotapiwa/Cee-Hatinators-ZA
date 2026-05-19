# Architecture Audit - Cee Hatinators

Audit date: 2026-05-18

## Current State

This project is a Vite React single-page e-commerce frontend for "Cee Hatinators - Elegant Occasion Headwear". It has a polished storefront shell, mock product/category data, Firebase Auth/Firestore wiring, Firestore rules, and an early Stripe checkout scaffold. It is not yet a complete production e-commerce system.

The workspace is not currently a Git repository. `git status` fails with "not a git repository", so there is no local version-control baseline for this audit.

### Folder Structure

Top-level structure:

```text
Cee_Hatinators/
  .env.example
  .gitignore
  firebase-applet-config.json
  firebase-blueprint.json
  firestore.rules
  index.html
  metadata.json
  package-lock.json
  package.json
  PROJECT_FILES.txt
  PROJECT_TREE.txt
  README.md
  security_spec.md
  tsconfig.json
  vite.config.ts
  dist/
    index.html
    assets/
      index-C2yHgPAc.css
      index-DILYOil6.js
  node_modules/
  src/
    App.tsx
    index.css
    main.tsx
    components/
    context/
    lib/
    pages/
    services/
    types/
```

Application source structure:

```text
src/
  App.tsx
  main.tsx
  index.css
  components/
    AnnouncementBar.tsx
    Button.tsx
    CartDrawer.tsx
    CategoryGrid.tsx
    ContactForm.tsx
    FeaturedCollection.tsx
    FeatureStrip.tsx
    Footer.tsx
    Header.tsx
    Hero.tsx
    Marquee.tsx
    Newsletter.tsx
    ProductCard.tsx
    ProductDetailModal.tsx
    ProductGrid.tsx
    ProtectedRoute.tsx
    Testimonials.tsx
  context/
    AuthContext.tsx
    CartContext.tsx
    ProductModalContext.tsx
    SearchContext.tsx
  lib/
    firebase.ts
    mockData.ts
    stripe.ts
  pages/
    Account.tsx
    Categories.tsx
    Checkout.tsx
    Collections.tsx
    Home.tsx
    Login.tsx
    ProductDetail.tsx
    Register.tsx
    Shop.tsx
    Wishlist.tsx
  services/
    OrderService.ts
    ProductService.ts
    StripeService.ts
  types/
    index.ts
```

There are 41 source files under `src/`, 3 build output files under `dist/`, and roughly 18,302 installed files under `node_modules/`. `PROJECT_TREE.txt` and `PROJECT_FILES.txt` are very large generated audit/dump artifacts and should not be treated as application source.

## Current Tech Stack

- Runtime/build: Vite 6, React 19, TypeScript 5.8.
- Styling: Tailwind CSS 4 via `@tailwindcss/vite`, custom theme tokens in `src/index.css`, Google Fonts loaded in `index.html`.
- Routing: `react-router-dom` 7.
- State: React context for auth, cart, search, and product quick-view modal.
- Forms/validation: `react-hook-form`, `zod`, `@hookform/resolvers`.
- Backend services: Firebase client SDK for Auth and Firestore.
- Payments: Stripe client libraries are installed and partially scaffolded.
- UI utilities: `lucide-react`, `clsx`, `tailwind-merge`.
- Unused or not yet proven: `motion` is installed but no source usage was found.

## What Has Already Been Built

- Storefront layout:
  - Home page composed from hero, marquee, category grid, product grid, feature strip, featured collection, contact form, testimonials, and newsletter.
  - Header, announcement bar, footer, responsive mobile menu, global search input, cart button, account/wishlist links.

- Product browsing:
  - Shop page with category filter, basic search filtering, and price sorting.
  - Product detail route at `/product/:slug`, currently using product IDs rather than true slugs.
  - Product quick-view modal.
  - Product cards with quick add and wishlist-looking controls.

- Cart:
  - Cart context with localStorage persistence.
  - Add, remove, quantity update, clear cart, item count, and total price.
  - Cart drawer with checkout link.

- Auth:
  - Firebase Auth provider and admin check against `admins/{uid}`.
  - Login and register pages exist with email/password and Google popup sign-in.
  - Protected route component exists.

- Checkout:
  - Multi-step shipping/payment UI.
  - Form validation with Zod.
  - Delivery options, promo code `CEEHATINATORS10`, cart summary, and mock payment flow.
  - `OrderService` can create orders and read orders by user.
  - `StripeService` can call a future checkout API or fall back to mock mode.

- Firebase/Firestore:
  - Firebase config is present in `firebase-applet-config.json`.
  - Firestore rules exist for `admins`, `products`, `users`, and `orders`.
  - `firebase-blueprint.json` documents Product, User, and Order entities.
  - `security_spec.md` documents intended Firestore security behavior.

## Risks

### Critical

- Auth routes are not wired. `LoginPage` and `RegisterPage` exist, and the header navigates to `/login` and `/register`, but `src/App.tsx` does not define those routes. Sign-in/create-account flows currently land on blank/unmatched routes.

- Checkout is routed to `CheckoutPage` instead of `CheckoutPageWithStripe`. `CheckoutPage` calls `useStripe()` and `useElements()`, which require an `<Elements>` provider. The wrapper exists but is unused in the router.

- TypeScript lint currently fails. `npm run lint` reports:
  - `import.meta.env` is not typed in `src/lib/stripe.ts`, `src/pages/Checkout.tsx`, and `src/services/StripeService.ts`.
  - `redirectToCheckout` is not found on the installed Stripe type.

- Client-side order payment status update conflicts with Firestore rules. Checkout creates a pending order, then mock mode calls `OrderService.updateOrderStatus(orderId, 'paid')` from the browser. Current rules only allow admins to update status, or owners to cancel pending orders. Also, `paid` is in the app's `OrderStatus` type but not in the Firestore rules' allowed status list.

### High

- The app depends heavily on mock data. Products fall back to `MOCK_PRODUCTS`, categories are mock-only, wishlist is mock-only, account orders are mock-only, collections are static, and contact/newsletter forms do not persist or send data.

- Product, order, and rules models are not aligned. `Product` in TypeScript lacks `stock`, while the blueprint/rules include it. `OrderService` includes `deliveryMethod`, `deliveryCost`, `promoCode`, `updatedAt`, `stripeSessionId`, and `paid`, while the Firestore rules only validate a smaller core order shape and omit `paid`.

- There is no backend. Stripe checkout sessions and webhooks require server-side code, but the project currently only contains frontend files and a commented webhook reference.

- The README and env example are still AI Studio/Gemini oriented. The app does not appear to use Gemini, but `vite.config.ts`, `.env.example`, and `README.md` still mention `GEMINI_API_KEY`.

- Encoding/mojibake appears throughout visible text and comments, especially currency symbols, dashes, bullets, stars, and emoji-like strings. This affects customer-facing UI text and documentation polish.

- Firestore error handling rethrows JSON strings from `handleFirestoreError`, and some services immediately swallow those thrown errors. This is useful for diagnostics but not yet shaped for user-facing error states.

### Medium

- No tests are present. There are no unit, component, integration, or Firestore rules tests despite a security spec.

- No admin/catalog management UI exists. Product CRUD is permitted only to admins by rules, but no admin product tools exist.

- Product detail route treats `:slug` as an ID and falls back to the first product if not found, which can silently show the wrong product.

- Footer links point to routes that do not exist: `/about`, `/shipping-returns`, `/faq`, and `/contact`.

- Collection links use `?collection=...`, but `ShopPage` ignores collection query params.

- Protected wishlist/account behavior is inconsistent. `WishlistPage` has unauthenticated UI, but the route is wrapped in `ProtectedRoute`, so that UI is unreachable. `ProtectedRoute` redirects anonymous users to `/` instead of `/login`.

- Cart is local-only and stores entire product snapshots. It does not track selected size/color, validate stock, handle stale prices, or recover from malformed localStorage JSON.

- `ProductService.createOrder` duplicates order creation logic already handled better by `OrderService`.

- Installed dependencies include likely unused packages, notably `motion`.

## Reusable Components

Strong candidates to keep and build on:

- `src/components/Button.tsx`: good small shared primitive using `clsx` and `tailwind-merge`.
- `src/components/Header.tsx`: useful responsive shell, search, account/cart controls, and mobile nav.
- `src/components/Footer.tsx`: reusable once links/routes are corrected.
- `src/components/ProductCard.tsx`: reusable product tile with image, badges, quick add, and color swatches.
- `src/components/ProductGrid.tsx`: reusable product-list presentation, though it should eventually become data-driven and accept props.
- `src/components/ProductDetailModal.tsx`: useful quick-view pattern.
- `src/components/CartDrawer.tsx`: useful drawer shell, but needs quantity controls and better checkout/empty state behavior.
- `src/context/CartContext.tsx`: reusable local cart foundation.
- `src/context/AuthContext.tsx`: reusable auth/admin foundation.
- `src/context/SearchContext.tsx`: reusable global query state if search remains global.
- `src/services/OrderService.ts`: closer to the right future order service than the duplicate order creation in `ProductService`.
- `src/lib/firebase.ts`: reusable Firebase initialization.
- `firestore.rules`, `firebase-blueprint.json`, and `security_spec.md`: valuable starting point for backend/security architecture.

Reusable as marketing/static sections, but not core commerce architecture:

- `Hero`, `Marquee`, `CategoryGrid`, `FeatureStrip`, `FeaturedCollection`, `Testimonials`, `Newsletter`, and `ContactForm`.

## Delete, Refactor, or Park

### Delete or Ignore from Source Control

- `dist/`: generated build output.
- `node_modules/`: installed dependencies.
- `PROJECT_TREE.txt` and `PROJECT_FILES.txt`: large generated dump files. Keep only temporarily outside the app source if they are needed for audit history.

### Refactor

- `src/App.tsx`: add missing auth routes and route checkout through `CheckoutPageWithStripe`.
- `src/pages/Checkout.tsx`: separate checkout UI, order creation, and payment orchestration. Avoid direct client-side status updates that rules will reject.
- `src/services/StripeService.ts`: replace mock/server notes with a real backend contract once backend is chosen.
- `src/services/OrderService.ts`: align status values and fields with Firestore rules and the blueprint.
- `src/services/ProductService.ts`: keep product fetching, remove or move duplicate `createOrder`.
- `src/types/index.ts`: create shared Product, CartItem, Order, Address, and Money/Price types that match Firestore.
- `src/components/ProductGrid.tsx` and `src/pages/Shop.tsx`: reduce duplicated filtering/listing behavior.
- `src/components/ProtectedRoute.tsx`: redirect to `/login?redirect=...` instead of `/`, once login is routed.
- `src/pages/Account.tsx` and `src/pages/Wishlist.tsx`: replace mock data with services or clearly park them as placeholders.
- `src/lib/mockData.ts`: keep as dev seed/demo data, but isolate it from production flows.
- `README.md`, `.env.example`, `vite.config.ts`: remove Gemini/AI Studio leftovers unless Gemini is a deliberate future feature.
- Encoding cleanup across source/docs: replace mojibake with proper UTF-8 text or ASCII alternatives.

### Park

- Wishlist persistence, returns flow, saved addresses, order tracking, newsletter automation, testimonials, contact form delivery, and social links can be parked until the core buy flow is stable.
- Motion/animation dependency can be parked or removed unless there is a concrete animation plan.

## Missing Core E-Commerce Features

- Real product catalog in Firestore with seed/import process.
- Product detail retrieval by ID or slug.
- Inventory/stock checks before checkout.
- Product variants: size, color, fabric length, made-to-order options.
- Cart item identity that includes selected variant/options, not just product ID.
- Price authority on the server or trusted backend; current cart totals are client-calculated.
- Real checkout backend for Stripe session creation.
- Stripe webhook handler to mark orders paid/failed/refunded.
- Order confirmation page and email receipt flow.
- Customer order history connected to Firestore.
- Real wishlist storage per user.
- Customer saved addresses.
- Admin product/order management.
- Shipping/tax calculation strategy.
- Promo/discount validation outside the client.
- Returns/refunds workflow.
- Search and filters backed by catalog data.
- Error/loading/empty states for Firestore and payment failures.
- Tests for cart, checkout, auth routing, Firestore services, and security rules.
- Deployment/environment documentation.

## Recommended Next Steps

1. Stabilize routing and compile health.
   - Add `/login` and `/register` routes.
   - Route `/checkout` through the Stripe `Elements` wrapper.
   - Add Vite env typing so `import.meta.env` compiles.
   - Resolve the Stripe type/API mismatch around `redirectToCheckout`.

2. Decide the architecture boundary.
   - Keep the frontend as a Vite SPA.
   - Add a backend layer for Stripe session creation, webhooks, order status updates, promo validation, and inventory checks. Firebase Cloud Functions is the most natural fit because Firebase is already present.

3. Align the data model.
   - Make TypeScript types, `firebase-blueprint.json`, Firestore rules, and service payloads agree.
   - Decide final order statuses. Include `paid` everywhere or replace it with an allowed status.
   - Define product variants and stock rules before extending checkout.

4. Replace mock commerce data in stages.
   - First: products from Firestore with a seed script/admin-only seed process.
   - Second: orders from Firestore in Account.
   - Third: wishlist and saved addresses.

5. Harden checkout.
   - Server validates cart items, prices, stock, discounts, shipping, and user ownership.
   - Client creates pending order or receives order/session from server.
   - Stripe webhook confirms payment and updates order status server-side.
   - Client redirects to a real order confirmation page.

6. Clean project hygiene.
   - Initialize Git or move into an existing repository.
   - Remove generated dump files from source control.
   - Keep `dist/` and `node_modules/` ignored.
   - Clean AI Studio/Gemini leftovers from docs/config.
   - Fix encoding issues in customer-facing strings.

7. Add focused tests.
   - Start with `CartContext`, route protection, checkout validation, order service payloads, and Firestore rules.
   - Add at least one smoke test for the main purchase path once routing and checkout are stable.

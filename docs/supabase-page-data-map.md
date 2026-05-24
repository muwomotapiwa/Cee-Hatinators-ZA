# Supabase Page and Data Map

## Purpose

This document maps the Cee Hatinators storefront pages to the Supabase tables they should use in a future implementation sprint.

This is a planning document only. It does not create tables, policies, migrations, admin screens, checkout logic, or payment logic.

## Security Note

The database password must not be stored in the frontend, documentation, Git history, or chat transcripts.

Any password shared in chat should be treated as exposed and rotated in Supabase before production use.

The frontend should only use:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Direct Postgres connection strings, database passwords, service role keys, and payment secrets are server-only.

## Role Model

The first launch role model is intentionally simple:

- `general_user`
- `super_user`

General users are signed-in customer accounts. Public unauthenticated visitors can browse published content and submit public forms where allowed.

Super users can access a protected portal and manage editable site content, catalogue content, and operational records approved for admin editing.

Initial super user:

```text
Name: Celia Rimayi
Email: ndinimuridzi@ceehatinators.co.za
Role: super_user
```

Do not store the password for this user in project files. Create the user through Supabase Auth or the Supabase dashboard, then assign `super_user` in the `profiles` table.

## Recommended Auth Tables

### `profiles`

Purpose:

- Stores public/admin profile metadata for Supabase Auth users.

Fields:

- `id uuid primary key references auth.users(id)`
- `email text not null unique`
- `full_name text`
- `phone text`
- `role text not null default 'general_user'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Role values:

- `general_user`
- `super_user`

Rules:

- Users may read/update their own non-role profile fields.
- Only a super user may assign or change roles.
- No user may grant themselves `super_user`.

## Core Site Tables

### `site_settings`

Used by:

- Header
- Announcement bar
- Footer
- Contact section
- SEO defaults

Fields:

- `id uuid primary key`
- `site_name text`
- `announcement_text text`
- `logo_url text`
- `contact_email text`
- `contact_phone text`
- `contact_address text`
- `social_links jsonb`
- `shipping_summary jsonb`
  - `rates`: footer/display shipping lines
  - `methods`: checkout delivery methods with `id`, `label`, `description`, and ZAR `price`
- `status text not null default 'active'`
- `updated_at timestamptz not null default now()`

Access:

- Visitors can read active settings.
- Super users can update.

### `site_content_blocks`

Used by:

- Home page hero
- Marquee
- Feature strip
- Featured collection copy
- Contact section copy
- Newsletter heading/copy
- Footer statement
- Our Story page copy

Fields:

- `id uuid primary key`
- `page_key text not null`
- `block_key text not null`
- `title text`
- `subtitle text`
- `body text`
- `media_url text`
- `button_label text`
- `button_url text`
- `metadata jsonb`
- `sort_order integer not null default 0`
- `status text not null default 'active'`
- `updated_at timestamptz not null default now()`

Access:

- Visitors can read active content blocks.
- Super users can create, update, archive, and reorder blocks.

### `navigation_items`

Used by:

- Header nav
- Footer nav
- Mobile menu

Fields:

- `id uuid primary key`
- `area text not null`
- `label text not null`
- `url text not null`
- `sort_order integer not null default 0`
- `status text not null default 'active'`

Access:

- Visitors can read active nav items.
- Super users can manage nav items.

## Catalogue Tables

### `categories`

Used by:

- Home category grid
- Categories page
- Shop sidebar/filter
- Product detail breadcrumbs
- Super-user category editor

Fields:

- `id uuid primary key`
- `slug text not null unique`
- `name text not null`
- `description text`
- `image_url text`
- `parent_category_id uuid references categories(id)`
- `sort_order integer not null default 0`
- `status text not null default 'draft'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Access:

- Visitors can read active categories.
- Super users can manage categories.

### `collections`

Used by:

- Collections page
- Footer collection links
- Shop collection filters later
- Super-user collection editor

Fields:

- `id uuid primary key`
- `slug text not null unique`
- `name text not null`
- `description text`
- `hero_image_url text`
- `featured_product_slug text`
- `image_position text default 'left'`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `sort_order integer not null default 0`
- `status text not null default 'draft'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Access:

- Visitors can read active/current collections.
- Super users can manage collections.

### `spotlight_collections`

Used by:

- Home Spotlight Collection section
- Super-user Spotlight Collection editor

Fields:

- `id uuid primary key`
- `eyebrow text`
- `title text not null`
- `description text`
- `hero_image_url text`
- `image_urls jsonb`
- `details jsonb`
- `button_label text`
- `collection_slug text`
- `sort_order integer not null default 0`
- `status text not null default 'draft'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Access:

- Visitors can read active spotlight records.
- Super users can manage spotlight records.
- If there is no active record, the home Spotlight Collection section is hidden.

### `products`

Used by:

- Home product grid
- Shop page
- Product detail page
- Search
- Quick-view modal
- Wishlist display
- Checkout display only
- Super-user product editor

Fields:

- `id uuid primary key`
- `slug text not null unique`
- `name text not null`
- `short_description text`
- `description text`
- `base_price_minor integer not null`
- `currency text not null default 'ZAR'`
- `compare_at_price_minor integer`
- `primary_image_url text`
- `gallery_image_urls jsonb`
- `badge text`
- `colors jsonb`
- `styling_note text`
- `show_on_collections_page boolean default false`
- `collection_page_title text`
- `collection_page_description text`
- `collection_page_image_url text`
- `collection_page_image_position text default 'left'`
- `status text not null default 'draft'`
- `featured boolean not null default false`
- `sort_order integer not null default 0`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Access:

- Visitors can read active products.
- Super users can manage products.

Important:

- Product prices are public display data only.
- Checkout must still validate prices on a trusted backend or Supabase Edge Function before payment.

### `product_categories`

Used by:

- Shop filtering
- Categories page product linking
- Product detail related-products query

Fields:

- `product_id uuid references products(id) on delete cascade`
- `category_id uuid references categories(id) on delete cascade`
- Primary key: `product_id`, `category_id`

Access:

- Visitors can read active relationships through product/category queries.
- Super users can manage.

### `product_collections`

Used by:

- Shop collection filtering
- Product-to-collection assignment

Fields:

- `product_id uuid references products(id) on delete cascade`
- `collection_id uuid references collections(id) on delete cascade`
- Primary key: `product_id`, `collection_id`

Access:

- Visitors can read active relationships through product/collection queries.
- Super users can manage.

### `occasions`

Used by:

- Shop occasion filter sidebar
- Product detail/filter metadata
- Super-user occasion editor

Fields:

- `id uuid primary key`
- `slug text not null unique`
- `name text not null`
- `description text`
- `sort_order integer not null default 0`
- `status text not null default 'draft'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Access:

- Visitors can read active occasions.
- Super users can create, update, archive, and reorder occasions.

### `product_occasions`

Used by:

- Shop occasion filtering
- Product-to-occasion assignments in the super-user portal

Fields:

- `product_id uuid references products(id) on delete cascade`
- `occasion_id uuid references occasions(id) on delete cascade`
- Primary key: `product_id`, `occasion_id`

Access:

- Visitors can read active relationships through product/occasion queries.
- Super users can manage assignments.

### `product_images`

Used by:

- Product cards
- Product detail gallery
- Quick-view modal
- Category/collection editorial sections
- Super-user media management

Fields:

- `id uuid primary key`
- `product_id uuid references products(id) on delete cascade`
- `url text not null`
- `alt text not null`
- `sort_order integer not null default 0`
- `is_primary boolean not null default false`
- `created_at timestamptz not null default now()`

Access:

- Visitors can read images for active products.
- Super users can manage.

### `product_variants`

Used by:

- Product detail options
- Cart item identity later
- Checkout validation later
- Super-user variant editor

Fields:

- `id uuid primary key`
- `product_id uuid references products(id) on delete cascade`
- `sku text unique`
- `name text`
- `option_values jsonb`
- `price_minor integer`
- `currency text default 'ZAR'`
- `stock_tracked boolean not null default false`
- `stock_available integer`
- `status text not null default 'active'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Access:

- Visitors can read active variants for active products.
- Super users can manage variants.

Important:

- Stock is display-only in the browser.
- Stock validation and inventory changes must be trusted backend/Edge Function operations.

## Visitor Interaction Tables

### `newsletter_subscribers`

Used by:

- Newsletter section
- Super-user subscriber list/export

Fields:

- `id uuid primary key`
- `email text not null unique`
- `source text`
- `status text not null default 'active'`
- `created_at timestamptz not null default now()`

Access:

- Visitors can insert their own email.
- Super users can read/manage subscribers.

### `contact_messages`

Used by:

- Contact form
- Super-user inbox

Fields:

- `id uuid primary key`
- `name text not null`
- `email text not null`
- `subject text`
- `message text not null`
- `status text not null default 'new'`
- `created_at timestamptz not null default now()`

Access:

- Visitors can insert messages.
- Super users can read/update status.
- Visitors cannot list messages.

### `testimonials`

Used by:

- Home testimonials section
- Super-user testimonial editor

Fields:

- `id uuid primary key`
- `customer_name text not null`
- `location text`
- `image_url text`
- `rating integer`
- `quote text not null`
- `sort_order integer not null default 0`
- `status text not null default 'draft'`
- `created_at timestamptz not null default now()`

Access:

- Visitors can read active testimonials.
- Super users can manage.
- If there are no active testimonials, the home testimonials section is hidden.
- The storefront shows up to six active testimonials, centered by row. Optional `image_url` displays the person image.

## Commerce Tables For Later Backend Work

These tables are needed for production commerce, but should not be wired directly from the browser as authority.

### `orders`

Used by:

- Checkout confirmation later
- Account page/order history later
- Super-user order portal

Backend/Edge Function ownership:

- Create order from validated cart.
- Calculate totals.
- Set payment status only from provider confirmation/webhook.

### `order_items`

Used by:

- Order detail pages
- Super-user order review

Backend/Edge Function ownership:

- Snapshot product names, selected options, unit prices, and line totals at purchase time.

### `payments`

Used by:

- Super-user payment support view
- Customer safe payment summary later

Backend/Edge Function ownership:

- Payment provider session IDs.

## Account Portal Tables

These tables support the signed-in account page. The browser may display these records and allow account/profile edits, saved address edits, wishlist edits, and return requests. The browser must not be the authority for prices, payment status, stock, or checkout totals.

### `customer_addresses`

Used by:

- Account saved addresses
- Super-user customer dashboard

Access:

- Customers can create, read, update, and archive their own addresses.
- Super users can manage all customer addresses.

### `customer_orders`

Used by:

- Account order history
- Track order view
- Super-user customer dashboard

Access:

- Customers can read their own orders.
- Super users can read and manage operational order fields.
- Payment status and totals must still be written by a trusted backend/service role, not the browser.

### `customer_cart_items`

Used by:

- Signed-in customer Your Bag persistence
- Super-user customer dashboard bag review

Access:

- Customers can create, read, update, and remove their own saved bag rows.
- Super users can read and manage all customer bag rows.
- Anonymous visitor carts remain local-only and are not visible to super users.

Important:

- These rows are saved-bag display/support data only.
- Checkout totals, final prices, stock, discounts, inventory, and payment state still require a trusted backend before production checkout.

### `return_requests`

Used by:

- Account returns view
- Super-user customer dashboard

Access:

- Customers can create and view their own return requests.
- Customers can update only their own request while it is still `requested`.
- Super users can manage all return requests.
- Payment status.
- Refund state.

### `inventory_movements`

Used by:

- Super-user stock audit later

Backend/Edge Function ownership:

- Stock adjustments after payment or manual super-user stock changes.

## Page-To-Table Map

| Page / Area | Reads From | Writes To | Notes |
| --- | --- | --- | --- |
| Announcement bar | `site_settings` | None for visitors | Super user edits in portal. |
| Header | `site_settings`, `navigation_items` | None for visitors | Auth state controls portal link visibility. |
| Home | `site_content_blocks`, `spotlight_collections`, `categories`, `collections`, `products`, `product_images`, `testimonials`, `site_settings` | `newsletter_subscribers`, `contact_messages` | Spotlight section is hidden when no active spotlight record exists. |
| Shop | `products`, `product_images`, `product_variants`, `categories`, `product_categories`, `occasions`, `product_occasions` | None for visitors | Filtering uses public active records. |
| Categories | `categories` | None for visitors | Super user manages category tiles. |
| Collections | `products`, `collections`, `product_collections` | None for visitors | Product records can be marked for the Collections page, choose title/copy/image, and set image left/right layout. Older collection records remain a fallback. |
| Product detail | `products`, `product_images`, `product_variants`, `categories`, `collections` | None for visitors | Add-to-cart remains local until checkout validation. |
| Quick-view modal | `products`, `product_images`, `product_variants` | None for visitors | Same data as product detail. |
| Our Story | `site_content_blocks` | None for visitors | Super user edits page copy/media. |
| Contact section/page | `site_settings`, `site_content_blocks` | `contact_messages` | Visitors can submit, not list. |
| Newsletter | `site_content_blocks` | `newsletter_subscribers` | Visitors can subscribe, not list. |
| Footer | `site_settings`, `navigation_items`, `site_content_blocks` | None for visitors | Super user edits footer statement, links, and shipping display lines. |
| Login/Register | Supabase Auth later | `auth.users`, `profiles` through auth flow | Current app still uses Firebase until migration is approved. |
| Wishlist | `products`, `wishlist_items` | `wishlist_items` | Signed-in users can add and remove saved products. Each wishlist record belongs to the current auth user. |
| Account | `profiles`, `customer_addresses`, `customer_orders`, `return_requests`, `wishlist_items`, `customer_cart_items`, `products` | own profile, address, wishlist, saved bag, and return-request records | Signed-in customers use role `general_user`; super users see all users and customer bag rows in a dashboard view. |
| Checkout | `products`, `product_variants`, `site_settings.shipping_summary.methods` for display only | trusted Edge Function creates `orders`, `order_items`, `payments` | Delivery prices are editable display values for now; production checkout must still validate totals server-side. |
| Super-user portal | All editable tables | Editable tables | Requires Supabase Auth and `profiles.role = 'super_user'`. |

## Super-User Portal Map

Recommended route group:

```text
/#/portal
/#/portal/content
/#/portal/spotlight-collection
/#/portal/products
/#/portal/categories
/#/portal/occasions
/#/portal/collections
/#/portal/testimonials
/#/portal/messages
/#/portal/newsletter
/#/portal/orders
/#/portal/settings
```

Portal sections:

- Dashboard: summary of messages, products, and recent orders.
- Content: edit hero, newsletter, footer, our story, contact copy, feature strips.
- Spotlight Collection: edit the home spotlight images, copy, bullet lines, and shop link. If no active record exists, the section is hidden.
- Products: create/edit/archive products, images, variants, New Headwear featured status, and Collections page placement/layout.
- Categories: create/edit/archive/reorder categories.
- Occasions: create/edit/archive/reorder occasion filters and assign them to hats.
- Collections: create/edit/archive/reorder legacy collection rows, assign the featured product for the Collections page, and choose image left/right layout.
- Testimonials: create/edit/archive/reorder customer stories shown on the home page.
- Messages: view and mark contact messages as handled.
- Newsletter: view/export subscribers.
- Orders: view orders after backend checkout is implemented.
- Settings: site name, announcement text, contact details, social links, shipping display text.

Visibility:

- Visitors must not see portal links.
- Super user sees portal entry in header/account area after login.
- Route guard must check Supabase Auth user and `profiles.role = 'super_user'`.

## RLS Policy Direction

All public tables should have Row Level Security enabled.

Visitor read policies:

- Allow `select` only where `status = 'active'`.
- For scheduled collections/content, also check date windows when fields exist.

Visitor insert policies:

- Allow inserts into `newsletter_subscribers` with safe fields only.
- Allow inserts into `contact_messages` with safe fields only.

Super-user policies:

- Allow `select`, `insert`, `update`, and archive-style updates when the authenticated user's `profiles.role = 'super_user'`.
- Avoid hard deletes for products, categories, collections, orders, and records that may be referenced historically.

Commerce policies:

- Do not allow visitors to directly create paid orders.
- Do not allow browser clients to update `payment_status`, payment records, stock fields, inventory movements, discounts, or final totals.
- Use Supabase Edge Functions or another trusted backend boundary for checkout, payment webhooks, stock, discounts, and final order creation.

## Implementation Sequence

1. Create Supabase migrations for roles, profiles, content, catalogue, contact, and newsletter tables.
2. Enable RLS on every public schema table.
3. Create Celia Rimayi in Supabase Auth with a rotated password.
4. Insert Celia's `profiles` row with `role = 'super_user'`.
5. Seed current mock categories, products, content blocks, testimonials, footer copy, and newsletter copy.
6. Build read-only public Supabase services for storefront pages.
7. Build protected portal shell and route guard.
8. Add portal CRUD for content, categories, collections, and products.
9. Add checkout/order/payment Edge Functions only after commerce decisions are approved.

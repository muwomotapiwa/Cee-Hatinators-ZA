-- Cee Hatinators Supabase initial site schema
-- Run this in the Supabase SQL Editor after reviewing the table plan.
-- Do not place database passwords or service role keys in frontend files.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  role text not null default 'general_user' check (role in ('general_user', 'super_user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'name'
    ),
    'general_user'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_super_user()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'super_user'
  );
$$;

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text,
  announcement_text text,
  logo_url text,
  contact_email text,
  contact_phone text,
  contact_address text,
  footer_statement text,
  social_links jsonb not null default '{}'::jsonb,
  shipping_summary jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_content_blocks (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  block_key text not null,
  title text,
  subtitle text,
  body text,
  media_url text,
  button_label text,
  button_url text,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_key, block_key)
);

create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  label text not null,
  url text not null,
  sort_order integer not null default 0,
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  parent_category_id uuid references public.categories(id),
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  hero_image_url text,
  featured_product_slug text,
  image_position text not null default 'left' check (image_position in ('left', 'right')),
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.spotlight_collections (
  id uuid primary key default gen_random_uuid(),
  eyebrow text,
  title text not null,
  description text,
  hero_image_url text,
  image_urls jsonb,
  details jsonb,
  button_label text,
  collection_slug text,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text,
  description text,
  base_price_minor integer not null check (base_price_minor >= 0),
  currency text not null default 'ZAR',
  compare_at_price_minor integer check (compare_at_price_minor is null or compare_at_price_minor >= 0),
  primary_image_url text,
  gallery_image_urls jsonb,
  badge text,
  colors jsonb,
  styling_note text,
  show_on_collections_page boolean not null default false,
  collection_page_title text,
  collection_page_description text,
  collection_page_image_url text,
  collection_page_image_position text not null default 'left' check (collection_page_image_position in ('left', 'right')),
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table if not exists public.product_collections (
  product_id uuid not null references public.products(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  primary key (product_id, collection_id)
);

create table if not exists public.occasions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_occasions (
  product_id uuid not null references public.products(id) on delete cascade,
  occasion_id uuid not null references public.occasions(id) on delete cascade,
  primary key (product_id, occasion_id)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text not null,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text unique,
  name text,
  option_values jsonb not null default '{}'::jsonb,
  price_minor integer check (price_minor is null or price_minor >= 0),
  currency text not null default 'ZAR',
  stock_tracked boolean not null default false,
  stock_available integer,
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  status text not null default 'active' check (status in ('active', 'unsubscribed', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_slug)
);

create table if not exists public.customer_cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  quantity integer not null default 1 check (quantity > 0),
  item_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_slug)
);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Delivery',
  full_name text not null,
  phone text,
  line1 text not null,
  line2 text,
  city text not null,
  province text,
  postal_code text,
  country text not null default 'South Africa',
  is_default boolean not null default false,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_number text not null unique,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
  tracking_number text,
  tracking_url text,
  carrier text,
  items jsonb not null default '[]'::jsonb,
  subtotal_minor integer not null default 0 check (subtotal_minor >= 0),
  delivery_minor integer not null default 0 check (delivery_minor >= 0),
  total_minor integer not null default 0 check (total_minor >= 0),
  currency text not null default 'ZAR',
  shipping_address jsonb,
  placed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.return_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.customer_orders(id) on delete set null,
  reason text not null,
  message text,
  status text not null default 'requested' check (status in ('requested', 'reviewing', 'approved', 'declined', 'received', 'refunded', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'handled', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  location text,
  image_url text,
  rating integer check (rating is null or rating between 1 and 5),
  quote text not null,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

create trigger site_content_blocks_set_updated_at before update on public.site_content_blocks
for each row execute function public.set_updated_at();

create trigger navigation_items_set_updated_at before update on public.navigation_items
for each row execute function public.set_updated_at();

create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();

create trigger collections_set_updated_at before update on public.collections
for each row execute function public.set_updated_at();

create trigger spotlight_collections_set_updated_at before update on public.spotlight_collections
for each row execute function public.set_updated_at();

create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();

create trigger product_variants_set_updated_at before update on public.product_variants
for each row execute function public.set_updated_at();

create trigger occasions_set_updated_at before update on public.occasions
for each row execute function public.set_updated_at();

create trigger contact_messages_set_updated_at before update on public.contact_messages
for each row execute function public.set_updated_at();

create trigger testimonials_set_updated_at before update on public.testimonials
for each row execute function public.set_updated_at();

create trigger customer_addresses_set_updated_at before update on public.customer_addresses
for each row execute function public.set_updated_at();

create trigger customer_cart_items_set_updated_at before update on public.customer_cart_items
for each row execute function public.set_updated_at();

create trigger customer_orders_set_updated_at before update on public.customer_orders
for each row execute function public.set_updated_at();

create trigger return_requests_set_updated_at before update on public.return_requests
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_content_blocks enable row level security;
alter table public.navigation_items enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.spotlight_collections enable row level security;
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_collections enable row level security;
alter table public.occasions enable row level security;
alter table public.product_occasions enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.customer_cart_items enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.customer_orders enable row level security;
alter table public.return_requests enable row level security;
alter table public.contact_messages enable row level security;
alter table public.testimonials enable row level security;

create policy "profiles read own or super user"
on public.profiles for select
using (id = auth.uid() or public.is_super_user());

create policy "profiles insert own general user"
on public.profiles for insert
with check (id = auth.uid() and role = 'general_user');

create policy "profiles update own general user fields"
on public.profiles for update
using (id = auth.uid() and role = 'general_user')
with check (id = auth.uid() and role = 'general_user');

create policy "profiles super user manage"
on public.profiles for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "site settings public read active"
on public.site_settings for select
using (status = 'active');

create policy "site settings super user manage"
on public.site_settings for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "content public read active"
on public.site_content_blocks for select
using (status = 'active');

create policy "content super user manage"
on public.site_content_blocks for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "navigation public read active"
on public.navigation_items for select
using (status = 'active');

create policy "navigation super user manage"
on public.navigation_items for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "categories public read active"
on public.categories for select
using (status = 'active');

create policy "categories super user manage"
on public.categories for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "collections public read active"
on public.collections for select
using (
  status = 'active'
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

create policy "collections super user manage"
on public.collections for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "spotlight collections public read active"
on public.spotlight_collections for select
using (status = 'active');

create policy "spotlight collections super user manage"
on public.spotlight_collections for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "products public read active"
on public.products for select
using (status = 'active');

create policy "products super user manage"
on public.products for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "product categories public read active"
on public.product_categories for select
using (
  exists (select 1 from public.products where id = product_id and status = 'active')
  and exists (select 1 from public.categories where id = category_id and status = 'active')
);

create policy "product categories super user manage"
on public.product_categories for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "product collections public read active"
on public.product_collections for select
using (
  exists (select 1 from public.products where id = product_id and status = 'active')
  and exists (select 1 from public.collections where id = collection_id and status = 'active')
);

create policy "product collections super user manage"
on public.product_collections for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "occasions public read active"
on public.occasions for select
using (status = 'active');

create policy "occasions super user manage"
on public.occasions for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "product occasions public read active"
on public.product_occasions for select
using (
  exists (select 1 from public.products where id = product_id and status = 'active')
  and exists (select 1 from public.occasions where id = occasion_id and status = 'active')
);

create policy "product occasions super user manage"
on public.product_occasions for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "product images public read for active products"
on public.product_images for select
using (
  exists (select 1 from public.products where id = product_id and status = 'active')
);

create policy "product images super user manage"
on public.product_images for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "product variants public read active"
on public.product_variants for select
using (
  status = 'active'
  and exists (select 1 from public.products where id = product_id and status = 'active')
);

create policy "product variants super user manage"
on public.product_variants for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "newsletter public insert"
on public.newsletter_subscribers for insert
with check (true);

create policy "newsletter super user read"
on public.newsletter_subscribers for select
using (public.is_super_user());

create policy "newsletter super user manage"
on public.newsletter_subscribers for update
using (public.is_super_user())
with check (public.is_super_user());

create policy "wishlist read own"
on public.wishlist_items for select
using (user_id = auth.uid());

create policy "wishlist insert own"
on public.wishlist_items for insert
with check (user_id = auth.uid());

create policy "wishlist delete own"
on public.wishlist_items for delete
using (user_id = auth.uid());

create policy "wishlist super user read"
on public.wishlist_items for select
using (public.is_super_user());

create policy "wishlist super user manage"
on public.wishlist_items for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "customer cart read own or super user"
on public.customer_cart_items for select
using (user_id = auth.uid() or public.is_super_user());

create policy "customer cart insert own"
on public.customer_cart_items for insert
with check (user_id = auth.uid());

create policy "customer cart update own"
on public.customer_cart_items for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "customer cart delete own"
on public.customer_cart_items for delete
using (user_id = auth.uid());

create policy "customer cart super user manage"
on public.customer_cart_items for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "customer addresses read own or super user"
on public.customer_addresses for select
using (user_id = auth.uid() or public.is_super_user());

create policy "customer addresses insert own"
on public.customer_addresses for insert
with check (user_id = auth.uid());

create policy "customer addresses update own"
on public.customer_addresses for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "customer addresses super user manage"
on public.customer_addresses for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "customer orders read own or super user"
on public.customer_orders for select
using (user_id = auth.uid() or public.is_super_user());

create policy "customer orders super user manage"
on public.customer_orders for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "return requests read own or super user"
on public.return_requests for select
using (user_id = auth.uid() or public.is_super_user());

create policy "return requests insert own"
on public.return_requests for insert
with check (user_id = auth.uid());

create policy "return requests update own while requested"
on public.return_requests for update
using (user_id = auth.uid() and status = 'requested')
with check (user_id = auth.uid() and status = 'requested');

create policy "return requests super user manage"
on public.return_requests for all
using (public.is_super_user())
with check (public.is_super_user());

create policy "contact public insert"
on public.contact_messages for insert
with check (true);

create policy "contact super user read"
on public.contact_messages for select
using (public.is_super_user());

create policy "contact super user manage"
on public.contact_messages for update
using (public.is_super_user())
with check (public.is_super_user());

create policy "testimonials public read active"
on public.testimonials for select
using (status = 'active');

create policy "testimonials super user manage"
on public.testimonials for all
using (public.is_super_user())
with check (public.is_super_user());

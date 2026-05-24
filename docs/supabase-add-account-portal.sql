-- Add customer account portal tables and policies.
-- Run this in the Supabase SQL Editor.
-- Normal customers use the `general_user` role. Super users use `super_user`.

alter table public.profiles
add column if not exists phone text;

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

drop trigger if exists customer_addresses_set_updated_at on public.customer_addresses;
create trigger customer_addresses_set_updated_at before update on public.customer_addresses
for each row execute function public.set_updated_at();

drop trigger if exists customer_orders_set_updated_at on public.customer_orders;
create trigger customer_orders_set_updated_at before update on public.customer_orders
for each row execute function public.set_updated_at();

drop trigger if exists return_requests_set_updated_at on public.return_requests;
create trigger return_requests_set_updated_at before update on public.return_requests
for each row execute function public.set_updated_at();

alter table public.customer_addresses enable row level security;
alter table public.customer_orders enable row level security;
alter table public.return_requests enable row level security;

drop policy if exists "wishlist super user read" on public.wishlist_items;
create policy "wishlist super user read"
on public.wishlist_items for select
using (public.is_super_user());

drop policy if exists "wishlist super user manage" on public.wishlist_items;
create policy "wishlist super user manage"
on public.wishlist_items for all
using (public.is_super_user())
with check (public.is_super_user());

drop policy if exists "customer addresses read own or super user" on public.customer_addresses;
create policy "customer addresses read own or super user"
on public.customer_addresses for select
using (user_id = auth.uid() or public.is_super_user());

drop policy if exists "customer addresses insert own" on public.customer_addresses;
create policy "customer addresses insert own"
on public.customer_addresses for insert
with check (user_id = auth.uid());

drop policy if exists "customer addresses update own" on public.customer_addresses;
create policy "customer addresses update own"
on public.customer_addresses for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "customer addresses super user manage" on public.customer_addresses;
create policy "customer addresses super user manage"
on public.customer_addresses for all
using (public.is_super_user())
with check (public.is_super_user());

drop policy if exists "customer orders read own or super user" on public.customer_orders;
create policy "customer orders read own or super user"
on public.customer_orders for select
using (user_id = auth.uid() or public.is_super_user());

drop policy if exists "customer orders super user manage" on public.customer_orders;
create policy "customer orders super user manage"
on public.customer_orders for all
using (public.is_super_user())
with check (public.is_super_user());

drop policy if exists "return requests read own or super user" on public.return_requests;
create policy "return requests read own or super user"
on public.return_requests for select
using (user_id = auth.uid() or public.is_super_user());

drop policy if exists "return requests insert own" on public.return_requests;
create policy "return requests insert own"
on public.return_requests for insert
with check (user_id = auth.uid());

drop policy if exists "return requests update own while requested" on public.return_requests;
create policy "return requests update own while requested"
on public.return_requests for update
using (user_id = auth.uid() and status = 'requested')
with check (user_id = auth.uid() and status = 'requested');

drop policy if exists "return requests super user manage" on public.return_requests;
create policy "return requests super user manage"
on public.return_requests for all
using (public.is_super_user())
with check (public.is_super_user());

notify pgrst, 'reload schema';

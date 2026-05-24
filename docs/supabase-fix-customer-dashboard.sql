-- Fix customer dashboard tables/columns used by the account page.
-- Run this once in the Supabase SQL Editor.
-- It is safe to run more than once.

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

alter table public.profiles
add column if not exists phone text;

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Delivery',
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  province text not null,
  postal_code text not null,
  country text not null default 'South Africa',
  is_default boolean not null default false,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

update public.customer_addresses
set
  phone = coalesce(phone, ''),
  province = coalesce(province, ''),
  postal_code = coalesce(postal_code, '')
where phone is null
   or province is null
   or postal_code is null;

alter table public.customer_addresses
alter column phone set not null,
alter column province set not null,
alter column postal_code set not null;

create table if not exists public.customer_cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  quantity integer not null default 1 check (quantity > 0),
  item_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_slug)
);

drop trigger if exists customer_addresses_set_updated_at on public.customer_addresses;
create trigger customer_addresses_set_updated_at before update on public.customer_addresses
for each row execute function public.set_updated_at();

drop trigger if exists customer_cart_items_set_updated_at on public.customer_cart_items;
create trigger customer_cart_items_set_updated_at before update on public.customer_cart_items
for each row execute function public.set_updated_at();

alter table public.customer_addresses enable row level security;
alter table public.customer_cart_items enable row level security;

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

drop policy if exists "customer cart read own or super user" on public.customer_cart_items;
create policy "customer cart read own or super user"
on public.customer_cart_items for select
using (user_id = auth.uid() or public.is_super_user());

drop policy if exists "customer cart insert own" on public.customer_cart_items;
create policy "customer cart insert own"
on public.customer_cart_items for insert
with check (user_id = auth.uid());

drop policy if exists "customer cart update own" on public.customer_cart_items;
create policy "customer cart update own"
on public.customer_cart_items for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "customer cart delete own" on public.customer_cart_items;
create policy "customer cart delete own"
on public.customer_cart_items for delete
using (user_id = auth.uid());

drop policy if exists "customer cart super user manage" on public.customer_cart_items;
create policy "customer cart super user manage"
on public.customer_cart_items for all
using (public.is_super_user())
with check (public.is_super_user());

notify pgrst, 'reload schema';

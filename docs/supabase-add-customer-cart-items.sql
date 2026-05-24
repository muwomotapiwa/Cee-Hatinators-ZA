-- Add signed-in customer bag/cart sync for account and super-user visibility.
-- Run this in the Supabase SQL Editor.
-- This is display/saved-bag data only. Checkout totals, prices, stock, discounts,
-- and payment status must still be validated by a trusted backend before payment.

create table if not exists public.customer_cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  quantity integer not null default 1 check (quantity > 0),
  item_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_slug)
);

drop trigger if exists customer_cart_items_set_updated_at on public.customer_cart_items;
create trigger customer_cart_items_set_updated_at before update on public.customer_cart_items
for each row execute function public.set_updated_at();

alter table public.customer_cart_items enable row level security;

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

-- Add customer wishlist storage.
-- Run this in the Supabase SQL Editor, then refresh the site.

create table if not exists public.wishlist_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_slug)
);

alter table public.wishlist_items enable row level security;

drop policy if exists "wishlist read own" on public.wishlist_items;
drop policy if exists "wishlist insert own" on public.wishlist_items;
drop policy if exists "wishlist delete own" on public.wishlist_items;

create policy "wishlist read own"
on public.wishlist_items for select
using (user_id = auth.uid());

create policy "wishlist insert own"
on public.wishlist_items for insert
with check (user_id = auth.uid());

create policy "wishlist delete own"
on public.wishlist_items for delete
using (user_id = auth.uid());

notify pgrst, 'reload schema';

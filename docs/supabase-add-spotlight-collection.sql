-- Add a separate editable Spotlight Collection portal area.
-- Run this in the Supabase SQL Editor, then refresh the portal.
-- This does not create a default record. If there is no active record,
-- the Spotlight Collection section is hidden on the storefront.

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

drop trigger if exists spotlight_collections_set_updated_at on public.spotlight_collections;

create trigger spotlight_collections_set_updated_at before update on public.spotlight_collections
for each row execute function public.set_updated_at();

alter table public.spotlight_collections enable row level security;

drop policy if exists "spotlight collections public read active" on public.spotlight_collections;
drop policy if exists "spotlight collections super user manage" on public.spotlight_collections;

create policy "spotlight collections public read active"
on public.spotlight_collections for select
using (status = 'active');

create policy "spotlight collections super user manage"
on public.spotlight_collections for all
using (public.is_super_user())
with check (public.is_super_user());

notify pgrst, 'reload schema';

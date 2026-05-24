-- Add editable occasion filters and hat assignments.
-- Run this in the Supabase SQL Editor, then refresh the browser.

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

drop trigger if exists occasions_set_updated_at on public.occasions;

create trigger occasions_set_updated_at before update on public.occasions
for each row execute function public.set_updated_at();

alter table public.occasions enable row level security;
alter table public.product_occasions enable row level security;

drop policy if exists "occasions public read active" on public.occasions;
drop policy if exists "occasions super user manage" on public.occasions;
drop policy if exists "product occasions public read active" on public.product_occasions;
drop policy if exists "product occasions super user manage" on public.product_occasions;

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

insert into public.occasions (slug, name, sort_order, status)
values
  ('wedding', 'Wedding', 1, 'active'),
  ('church', 'Church', 2, 'active'),
  ('race-day', 'Race Day', 3, 'active'),
  ('formal-event', 'Formal Event', 4, 'active'),
  ('evening', 'Evening', 5, 'active')
on conflict (slug) do nothing;

notify pgrst, 'reload schema';

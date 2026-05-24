-- Run this if products was already created before colors and styling_note existed.

alter table public.products
add column if not exists colors jsonb;

alter table public.products
alter column colors drop default;

alter table public.products
alter column colors drop not null;

alter table public.products
add column if not exists styling_note text;

notify pgrst, 'reload schema';

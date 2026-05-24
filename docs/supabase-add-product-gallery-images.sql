-- Run this if products was already created before gallery_image_urls existed.

alter table public.products
add column if not exists gallery_image_urls jsonb;

alter table public.products
alter column gallery_image_urls drop default;

alter table public.products
alter column gallery_image_urls drop not null;

notify pgrst, 'reload schema';

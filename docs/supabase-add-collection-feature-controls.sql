-- Add Collections page controls.
-- Run this in the Supabase SQL Editor.
-- Products can be shown directly on the Collections page.
-- Older collection rows can also choose one product for the Explore link and choose which side the image appears on.

alter table public.products
add column if not exists show_on_collections_page boolean not null default false;

alter table public.products
add column if not exists collection_page_title text;

alter table public.products
add column if not exists collection_page_description text;

alter table public.products
add column if not exists collection_page_image_url text;

alter table public.products
add column if not exists collection_page_image_position text not null default 'left'
check (collection_page_image_position in ('left', 'right'));

alter table public.collections
add column if not exists featured_product_slug text;

alter table public.collections
add column if not exists image_position text not null default 'left'
check (image_position in ('left', 'right'));

notify pgrst, 'reload schema';

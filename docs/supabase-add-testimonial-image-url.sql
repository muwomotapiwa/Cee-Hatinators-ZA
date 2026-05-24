-- Add optional person image URLs to testimonials.
-- Run this in the Supabase SQL Editor, then refresh the portal.

alter table public.testimonials
add column if not exists image_url text;

notify pgrst, 'reload schema';

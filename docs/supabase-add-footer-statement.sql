-- Run this if site_settings was already created before footer_statement existed.

alter table public.site_settings
add column if not exists footer_statement text;

notify pgrst, 'reload schema';

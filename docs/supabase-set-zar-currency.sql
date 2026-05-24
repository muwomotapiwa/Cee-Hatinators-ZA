-- Set Cee Hatinators display currency to South African rand.
-- Run this in the Supabase SQL Editor.
-- This keeps money stored as minor units/cents, but uses ZAR as the fixed currency.

alter table public.products
alter column currency set default 'ZAR';

alter table public.product_variants
alter column currency set default 'ZAR';

update public.products
set currency = 'ZAR'
where currency is distinct from 'ZAR';

update public.product_variants
set currency = 'ZAR'
where currency is distinct from 'ZAR';

update public.site_settings
set
  contact_address = case
    when contact_address is null or contact_address ilike '%United Kingdom%' then 'South Africa'
    else contact_address
  end,
  shipping_summary = '{"rates":["South Africa only","Standard delivery: ZAR 99.00","Free delivery over ZAR 1,500.00"]}'::jsonb
where shipping_summary::text ~ '(GBP|USD|EUR|UK|USA|EU)';

update public.site_settings
set shipping_summary = coalesce(shipping_summary, '{}'::jsonb) || jsonb_build_object(
  'methods',
  jsonb_build_array(
    jsonb_build_object('id', 'standard', 'label', 'Standard Delivery', 'description', '3-5 business days in South Africa', 'price', 99),
    jsonb_build_object('id', 'express', 'label', 'Express Delivery', 'description', '1-2 business days in major centres', 'price', 149),
    jsonb_build_object('id', 'collection', 'label', 'Local Collection', 'description', 'Arranged after order confirmation', 'price', 0)
  )
)
where status = 'active'
  and not (shipping_summary ? 'methods');

notify pgrst, 'reload schema';

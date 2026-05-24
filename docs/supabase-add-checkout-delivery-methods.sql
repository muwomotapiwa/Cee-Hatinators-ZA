-- Add editable checkout delivery methods to site settings.
-- Run this in the Supabase SQL Editor.
-- Prices are stored in normal ZAR display units inside site_settings.shipping_summary.

update public.site_settings
set shipping_summary = coalesce(shipping_summary, '{}'::jsonb) || jsonb_build_object(
  'methods',
  jsonb_build_array(
    jsonb_build_object(
      'id', 'standard',
      'label', 'Standard Delivery',
      'description', '3-5 business days in South Africa',
      'price', 99
    ),
    jsonb_build_object(
      'id', 'express',
      'label', 'Express Delivery',
      'description', '1-2 business days in major centres',
      'price', 149
    ),
    jsonb_build_object(
      'id', 'collection',
      'label', 'Local Collection',
      'description', 'Arranged after order confirmation',
      'price', 0
    )
  )
)
where status = 'active';

notify pgrst, 'reload schema';

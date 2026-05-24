-- Add payment fields required by the Yoco hosted checkout flow.
-- Run this once in the Supabase SQL Editor before deploying the Edge Functions.
-- It is safe to run more than once.

alter table public.customer_orders
add column if not exists payment_provider text,
add column if not exists payment_status text not null default 'unpaid',
add column if not exists payment_reference text,
add column if not exists payment_checkout_id text,
add column if not exists payment_checkout_url text,
add column if not exists payment_webhook_event_id text,
add column if not exists payment_failure_reason text,
add column if not exists discount_minor integer not null default 0 check (discount_minor >= 0),
add column if not exists delivery_method text,
add column if not exists delivery_label text,
add column if not exists paid_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'customer_orders_payment_status_check'
      and conrelid = 'public.customer_orders'::regclass
  ) then
    alter table public.customer_orders
    add constraint customer_orders_payment_status_check
    check (payment_status in ('unpaid', 'payment_pending', 'paid', 'failed', 'cancelled', 'refunded'));
  end if;
end;
$$;

create index if not exists customer_orders_payment_checkout_id_idx
on public.customer_orders(payment_checkout_id);

notify pgrst, 'reload schema';

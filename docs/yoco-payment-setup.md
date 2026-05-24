# Yoco Payment Setup

Yoco is wired through Supabase Edge Functions so the browser never owns payment status, prices, discounts, or delivery totals.

## 1. Run the database migration

Open `docs/supabase-add-yoco-payments.sql`, paste the contents into the Supabase SQL Editor, and run it.

## 2. Add Supabase Edge Function secrets

Set these in Supabase. Do not place them in `.env`, `.env.local`, or frontend code.

```bash
supabase secrets set YOCO_SECRET_KEY="sk_test_or_live_from_yoco"
supabase secrets set YOCO_WEBHOOK_SECRET="whsec_value_returned_when_registering_the_webhook"
supabase secrets set SITE_URL="https://muwomotapiwa.github.io/Cee-Hatinators-ZA/"
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are available to hosted Supabase Edge Functions by default. If your project does not expose them automatically, set them as secrets too.

## 3. Deploy the functions

```bash
supabase functions deploy create-yoco-checkout
supabase functions deploy yoco-webhook
```

## 4. Register the Yoco webhook

Register this URL in Yoco:

```text
https://<your-project-ref>.functions.supabase.co/yoco-webhook
```

Save the returned `whsec_...` value as `YOCO_WEBHOOK_SECRET`. Yoco only shows it once.

## 5. Flow

1. Customer clicks Pay with Yoco.
2. `create-yoco-checkout` validates the signed-in user, loads active products from Supabase, calculates the ZAR total, creates a pending order, and asks Yoco for a hosted checkout URL.
3. Customer pays on Yoco.
4. `yoco-webhook` verifies Yoco's HMAC signature before marking the order paid.

More gateways can be added later by adding another provider function and routing it through `PaymentService`.

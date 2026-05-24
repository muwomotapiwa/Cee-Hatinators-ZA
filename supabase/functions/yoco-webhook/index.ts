import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.106.1';

type YocoEvent = {
  id: string;
  type: 'payment.succeeded' | 'payment.failed' | 'refund.succeeded' | 'refund.failed' | string;
  payload?: {
    id?: string;
    amount?: number;
    currency?: string;
    status?: string;
    failureReason?: string;
    metadata?: {
      checkoutId?: string;
      orderId?: string;
    };
  };
};

function text(status: number) {
  return new Response('', { status });
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function bytesToBase64(value: ArrayBuffer) {
  const bytes = new Uint8Array(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function constantTimeEqual(left: string, right: string) {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  if (leftBytes.length !== rightBytes.length) return false;

  let mismatch = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    mismatch |= leftBytes[index] ^ rightBytes[index];
  }

  return mismatch === 0;
}

async function verifyYocoSignature(req: Request, rawBody: string, secret: string) {
  const webhookId = req.headers.get('webhook-id');
  const timestamp = req.headers.get('webhook-timestamp');
  const signatureHeader = req.headers.get('webhook-signature');

  if (!webhookId || !timestamp || !signatureHeader) return false;

  const timestampValue = Number(timestamp);
  const timestampSeconds = timestampValue > 1_000_000_000_000 ? timestampValue / 1000 : timestampValue;
  const currentSeconds = Date.now() / 1000;
  if (!Number.isFinite(timestampSeconds) || Math.abs(currentSeconds - timestampSeconds) > 180) return false;

  const secretValue = secret.split('_')[1];
  if (!secretValue) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    base64ToBytes(secretValue),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signedContent = `${webhookId}.${timestamp}.${rawBody}`;
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedContent));
  const expectedSignature = bytesToBase64(digest);

  return signatureHeader
    .split(' ')
    .map((signature) => signature.split(',')[1])
    .filter(Boolean)
    .some((signature) => constantTimeEqual(signature, expectedSignature));
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return text(405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const webhookSecret = Deno.env.get('YOCO_WEBHOOK_SECRET');

  if (!supabaseUrl || !serviceRoleKey || !webhookSecret) return text(500);

  const rawBody = await req.text();
  const isValid = await verifyYocoSignature(req, rawBody, webhookSecret);
  if (!isValid) return text(403);

  const event = JSON.parse(rawBody) as YocoEvent;
  const checkoutId = event.payload?.metadata?.checkoutId;
  const orderId = event.payload?.metadata?.orderId;
  if (!checkoutId && !orderId) return text(200);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const orderQuery = supabase
    .from('customer_orders')
    .select('id, user_id, total_minor, currency')
    .limit(1);
  const { data: order } = orderId
    ? await orderQuery.eq('id', orderId).maybeSingle()
    : await orderQuery.eq('payment_checkout_id', checkoutId).maybeSingle();

  if (!order) return text(200);

  if (event.type === 'payment.succeeded') {
    if (event.payload?.amount !== order.total_minor || event.payload?.currency !== order.currency) {
      await supabase
        .from('customer_orders')
        .update({
          payment_status: 'failed',
          payment_webhook_event_id: event.id,
          payment_failure_reason: 'Webhook amount or currency did not match the order.',
        })
        .eq('id', order.id);
      return text(200);
    }

    await supabase
      .from('customer_orders')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        payment_reference: event.payload?.id || null,
        payment_webhook_event_id: event.id,
        payment_failure_reason: null,
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    await supabase
      .from('customer_cart_items')
      .delete()
      .eq('user_id', order.user_id);

    return text(200);
  }

  if (event.type === 'payment.failed') {
    await supabase
      .from('customer_orders')
      .update({
        payment_status: 'failed',
        payment_reference: event.payload?.id || null,
        payment_webhook_event_id: event.id,
        payment_failure_reason: event.payload?.failureReason || 'Yoco payment failed.',
      })
      .eq('id', order.id);
    return text(200);
  }

  if (event.type === 'refund.succeeded') {
    await supabase
      .from('customer_orders')
      .update({
        payment_status: 'refunded',
        payment_webhook_event_id: event.id,
      })
      .eq('id', order.id);
    return text(200);
  }

  return text(200);
});

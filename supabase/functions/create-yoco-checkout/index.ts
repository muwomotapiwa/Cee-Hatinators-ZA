import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.106.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CartLineInput = {
  id: string;
  quantity: number;
};

type ShippingAddressInput = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  base_price_minor: number;
  currency: string;
  primary_image_url: string | null;
  status: string;
};

type DeliveryMethod = {
  id: string;
  label: string;
  description: string;
  price: number;
};

const defaultDeliveryMethods: DeliveryMethod[] = [
  { id: 'standard', label: 'Standard Delivery', description: '3-5 business days in South Africa', price: 99 },
  { id: 'express', label: 'Express Delivery', description: '1-2 business days in major centres', price: 149 },
  { id: 'collection', label: 'Local Collection', description: 'Arranged after order confirmation', price: 0 },
];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function normalizeSiteUrl(value: string) {
  const trimmed = value.trim();
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

function toMinor(value: number) {
  return Math.round(value * 100);
}

function makeOrderNumber() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const suffix = crypto.randomUUID().slice(0, 6).toUpperCase();
  return `CEE-${stamp}-${suffix}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const yocoSecretKey = Deno.env.get('YOCO_SECRET_KEY');
  const siteUrl = normalizeSiteUrl(Deno.env.get('SITE_URL') || 'https://muwomotapiwa.github.io/Cee-Hatinators-ZA/');

  if (!supabaseUrl || !serviceRoleKey || !yocoSecretKey) {
    return json({ error: 'Payment server is not configured.' }, 500);
  }

  const authHeader = req.headers.get('Authorization') || '';
  const jwt = authHeader.replace('Bearer ', '').trim();
  if (!jwt) return json({ error: 'Please sign in before checking out.' }, 401);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await supabase.auth.getUser(jwt);
  if (authError || !authData.user) return json({ error: 'Your session has expired. Please sign in again.' }, 401);

  const body = await req.json().catch(() => null) as {
    provider?: string;
    items?: CartLineInput[];
    shippingAddress?: ShippingAddressInput;
    deliveryMethodId?: string;
    promoCode?: string | null;
  } | null;

  if (!body || body.provider !== 'yoco') return json({ error: 'Unsupported payment provider.' }, 400);
  if (!Array.isArray(body.items) || body.items.length === 0) return json({ error: 'Your bag is empty.' }, 400);
  if (!body.shippingAddress) return json({ error: 'Shipping address is required.' }, 400);

  const cartItems = body.items.map((item) => ({
    id: String(item.id || '').trim(),
    quantity: Math.max(1, Math.floor(Number(item.quantity) || 0)),
  })).filter((item) => item.id && item.quantity > 0);

  if (cartItems.length === 0) return json({ error: 'Your bag is empty.' }, 400);

  const productSlugs = [...new Set(cartItems.map((item) => item.id))];
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, slug, name, short_description, base_price_minor, currency, primary_image_url, status')
    .in('slug', productSlugs)
    .eq('status', 'active');

  if (productsError) return json({ error: 'Could not validate products.' }, 500);

  const productBySlug = new Map((products as ProductRow[] | null || []).map((product) => [product.slug, product]));
  const orderItems: Array<{
    product_id: string;
    product_slug: string;
    name: string;
    variant: string | null;
    quantity: number;
    price_minor: number;
    image: string | null;
  }> = [];

  for (const cartItem of cartItems) {
    const product = productBySlug.get(cartItem.id);
    if (!product) return json({ error: `Product is no longer available: ${cartItem.id}` }, 400);
    if (product.currency !== 'ZAR') return json({ error: `Product currency must be ZAR: ${product.slug}` }, 400);

    orderItems.push({
      product_id: product.id,
      product_slug: product.slug,
      name: product.name,
      variant: product.short_description,
      quantity: cartItem.quantity,
      price_minor: product.base_price_minor,
      image: product.primary_image_url,
    });
  }

  const subtotalMinor = orderItems.reduce((total, item) => total + item.price_minor * item.quantity, 0);
  const discountMinor = String(body.promoCode || '').trim().toUpperCase() === 'CEEHATINATORS10'
    ? Math.round(subtotalMinor * 0.1)
    : 0;

  const { data: settings } = await supabase
    .from('site_settings')
    .select('shipping_summary')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const settingsMethods = Array.isArray(settings?.shipping_summary?.methods)
    ? settings.shipping_summary.methods as DeliveryMethod[]
    : [];
  const deliveryMethods = settingsMethods.length ? settingsMethods : defaultDeliveryMethods;
  const deliveryMethod = deliveryMethods.find((method) => method.id === body.deliveryMethodId) || deliveryMethods[0];
  const deliveryMinor = toMinor(Number(deliveryMethod.price) || 0);
  const totalMinor = subtotalMinor - discountMinor + deliveryMinor;

  if (totalMinor <= 0) return json({ error: 'Order total must be greater than zero.' }, 400);

  const shippingAddress = {
    ...body.shippingAddress,
    country: body.shippingAddress.country === 'ZA' ? 'South Africa' : body.shippingAddress.country,
  };

  const { data: order, error: orderError } = await supabase
    .from('customer_orders')
    .insert({
      user_id: authData.user.id,
      order_number: makeOrderNumber(),
      status: 'pending',
      payment_provider: 'yoco',
      payment_status: 'payment_pending',
      items: orderItems,
      subtotal_minor: subtotalMinor,
      discount_minor: discountMinor,
      delivery_minor: deliveryMinor,
      total_minor: totalMinor,
      currency: 'ZAR',
      delivery_method: deliveryMethod.id,
      delivery_label: deliveryMethod.label,
      shipping_address: shippingAddress,
      placed_at: new Date().toISOString(),
    })
    .select('id, order_number')
    .single();

  if (orderError || !order) return json({ error: 'Could not create order.' }, 500);

  const yocoPayload = {
    amount: totalMinor,
    currency: 'ZAR',
    successUrl: `${siteUrl}#/account?payment=yoco-success&order=${order.id}`,
    cancelUrl: `${siteUrl}#/checkout?payment=yoco-cancelled&order=${order.id}`,
    failureUrl: `${siteUrl}#/checkout?payment=yoco-failed&order=${order.id}`,
    metadata: {
      orderId: order.id,
      orderNumber: order.order_number,
      userId: authData.user.id,
    },
    clientReferenceId: order.id,
    subtotalAmount: subtotalMinor,
    totalDiscount: discountMinor,
  };

  const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${yocoSecretKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': order.id,
    },
    body: JSON.stringify(yocoPayload),
  });

  const yocoData = await yocoResponse.json().catch(() => null) as {
    id?: string;
    redirectUrl?: string;
    paymentId?: string | null;
    message?: string;
  } | null;

  if (!yocoResponse.ok || !yocoData?.id || !yocoData.redirectUrl) {
    await supabase
      .from('customer_orders')
      .update({
        payment_status: 'failed',
        payment_failure_reason: yocoData?.message || 'Yoco checkout creation failed.',
      })
      .eq('id', order.id);

    return json({ error: yocoData?.message || 'Could not create Yoco checkout.' }, 502);
  }

  await supabase
    .from('customer_orders')
    .update({
      payment_checkout_id: yocoData.id,
      payment_checkout_url: yocoData.redirectUrl,
      payment_reference: yocoData.paymentId || null,
    })
    .eq('id', order.id);

  return json({
    orderId: order.id,
    checkoutId: yocoData.id,
    redirectUrl: yocoData.redirectUrl,
  });
});

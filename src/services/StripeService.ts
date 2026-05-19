/**
 * StripeService — client-side Stripe integration scaffold.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ARCHITECTURE OVERVIEW
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  CURRENT STATE (Phase 3 scaffold):
 *  ┌─────────────────┐         ┌──────────────────┐        ┌─────────────────┐
 *  │  React Frontend │─(stub)─▶│  Backend Endpoint│──────▶│  Stripe API     │
 *  │  /checkout      │         │  (not yet built) │        │  (test mode)    │
 *  └─────────────────┘         └──────────────────┘        └─────────────────┘
 *
 *  When the backend is ready, replace `createCheckoutSession` below with a
 *  real fetch() call to your Cloud Function / Edge Function / Express route.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WEBHOOK EVENTS TO HANDLE (server-side — see webhook stub below)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  payment_intent.succeeded          → mark order as paid in Firestore
 *  payment_intent.payment_failed     → mark order as failed
 *  charge.refunded                   → trigger refund flow
 *  customer.subscription.*           → (future) subscription management
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ENV VARIABLES REQUIRED (add to .env.local)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...   ← client-side, safe to expose
 *
 *  Server-side only (never in Vite / frontend):
 *  STRIPE_SECRET_KEY=sk_test_...
 *  STRIPE_WEBHOOK_SECRET=whsec_...
 */

import type { CartItem } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CheckoutSessionPayload {
  userId: string;
  items: CartItem[];
  shippingAddress: Record<string, string>;
  deliveryMethod: string;
  deliveryCost: number;
  promoCode?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  sessionId?: string;
  checkoutUrl?: string;
  clientSecret?: string;
  error?: string;
  /** True when running in mock mode (no backend configured) */
  isMock: boolean;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const StripeService = {
  /**
   * Creates a Stripe Checkout Session by calling your backend endpoint.
   *
   * REPLACE the mock block with a real fetch() once your backend is deployed:
   *
   *   const res = await fetch('/api/create-checkout-session', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify(payload),
   *   });
   *   const data = await res.json();
   *   return { checkoutUrl: data.url, sessionId: data.sessionId, isMock: false };
   */
  async createCheckoutSession(
    payload: CheckoutSessionPayload
  ): Promise<CheckoutSessionResult> {
    const backendUrl = import.meta.env.VITE_CHECKOUT_API_URL as string | undefined;

    if (!backendUrl) {
      // ── MOCK MODE ────────────────────────────────────────────────────────
      console.warn(
        '[StripeService] VITE_CHECKOUT_API_URL is not set. ' +
        'Running in mock mode — no real payment will be charged.'
      );
      // Simulate a short network delay
      await new Promise(r => setTimeout(r, 800));
      return {
        sessionId: `mock_session_${Date.now()}`,
        isMock: true,
      };
      // ─────────────────────────────────────────────────────────────────────
    }

    try {
      const res = await fetch(`${backendUrl}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        return { error: `Server error: ${text}`, isMock: false };
      }

      const data = await res.json() as {
        sessionId?: string;
        checkoutUrl?: string;
        url?: string;
        clientSecret?: string;
      };
      return {
        sessionId: data.sessionId,
        checkoutUrl: data.checkoutUrl ?? data.url,
        clientSecret: data.clientSecret,
        isMock: false,
      };
    } catch (err) {
      return { error: (err as Error).message, isMock: false };
    }
  },
};

// ─── Webhook handler stub (server-side reference — do NOT run in browser) ────
//
// This is a REFERENCE TEMPLATE for your backend. Copy it to your Cloud
// Function / Express route. Do not import this in frontend code.
//
// import Stripe from 'stripe';
//
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
//
// export async function handleStripeWebhook(req: Request): Promise<Response> {
//   const sig = req.headers.get('stripe-signature')!;
//   let event: Stripe.Event;
//
//   try {
//     const body = await req.text();
//     event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
//   } catch (err) {
//     return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
//   }
//
//   switch (event.type) {
//     case 'payment_intent.succeeded': {
//       const pi = event.data.object as Stripe.PaymentIntent;
//       // TODO: update order status in Firestore
//       // await OrderService.markAsPaid(pi.metadata.orderId);
//       break;
//     }
//     case 'payment_intent.payment_failed': {
//       // TODO: mark order as failed
//       break;
//     }
//     case 'charge.refunded': {
//       // TODO: trigger refund flow
//       break;
//     }
//     default:
//       console.log(`Unhandled event type: ${event.type}`);
//   }
//
//   return new Response(JSON.stringify({ received: true }), { status: 200 });
// }

/**
 * Stripe client-side initialisation.
 *
 * SETUP:
 *  1. Copy .env.example to .env.local
 *  2. Set VITE_STRIPE_PUBLISHABLE_KEY to your Stripe test publishable key
 *     (starts with pk_test_...)
 *  3. Never use live keys (pk_live_...) in this file until you are
 *     ready for production and have a proper backend.
 *
 * The `stripePromise` is a singleton — Stripe.js is only loaded once
 * no matter how many times the checkout page is rendered.
 */

import { loadStripe } from '@stripe/stripe-js';

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

if (!PUBLISHABLE_KEY) {
  console.warn(
    '[Stripe] VITE_STRIPE_PUBLISHABLE_KEY is not set. ' +
    'Add it to .env.local (pk_test_...) to enable real payment processing. ' +
    'The checkout will run in placeholder/mock mode until this is configured.'
  );
}

/**
 * Singleton Stripe.js promise. Pass this to <Elements stripePromise={stripePromise}>.
 * Will be `null` if the key is missing — Elements will gracefully degrade.
 */
export const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

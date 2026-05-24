import { supabase } from '../lib/supabase';

export type CheckoutPaymentProvider = 'yoco';

export interface CheckoutLineItemInput {
  id: string;
  quantity: number;
}

export interface CheckoutAddressInput {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CreateCheckoutInput {
  provider?: CheckoutPaymentProvider;
  items: CheckoutLineItemInput[];
  shippingAddress: CheckoutAddressInput;
  deliveryMethodId: string;
  promoCode?: string;
}

export interface CreateCheckoutResult {
  orderId?: string;
  checkoutId?: string;
  redirectUrl?: string;
  error?: string;
}

export const PaymentService = {
  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const { data, error } = await supabase.functions.invoke<CreateCheckoutResult>('create-yoco-checkout', {
      body: {
        provider: input.provider || 'yoco',
        items: input.items,
        shippingAddress: input.shippingAddress,
        deliveryMethodId: input.deliveryMethodId,
        promoCode: input.promoCode || null,
      },
    });

    if (error) return { error: error.message };
    if (data?.error) return { error: data.error };

    return data || { error: 'No checkout response was returned.' };
  },
};

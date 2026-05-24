import { supabase } from '../lib/supabase';
import type { ProfileRole } from '../context/AuthContext';
import type { Product } from '../types';

export interface AccountProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: ProfileRole;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerAddress {
  id?: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  status: 'active' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export interface CustomerOrderItem {
  name?: string;
  qty?: number;
  quantity?: number;
  price?: number;
  image?: string;
}

export interface CustomerOrder {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  tracking_number: string | null;
  tracking_url: string | null;
  carrier: string | null;
  items: CustomerOrderItem[] | null;
  subtotal_minor: number;
  delivery_minor: number;
  total_minor: number;
  currency: string;
  shipping_address: Record<string, unknown> | null;
  placed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type CustomerOrderUpdate = Partial<Pick<
  CustomerOrder,
  'status' | 'tracking_number' | 'tracking_url' | 'carrier' | 'subtotal_minor' | 'delivery_minor' | 'total_minor' | 'currency'
>>;

export interface ReturnRequest {
  id: string;
  user_id: string;
  order_id: string | null;
  reason: string;
  message: string | null;
  status: 'requested' | 'reviewing' | 'approved' | 'declined' | 'received' | 'refunded' | 'closed';
  created_at: string;
  updated_at: string;
}

export type ReturnRequestUpdate = Partial<Pick<ReturnRequest, 'reason' | 'message' | 'status'>>;

export interface WishlistItemRow {
  user_id: string;
  product_slug: string;
  created_at: string;
}

export interface CustomerCartItemRow {
  user_id: string;
  product_slug: string;
  quantity: number;
  item_snapshot: Product | null;
  updated_at: string;
  created_at: string;
}

export type AddressInput = Omit<CustomerAddress, 'id' | 'created_at' | 'updated_at'> & { id?: string };

function warn(scope: string, error: unknown) {
  const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : String(error);
  console.warn(`[Supabase] ${scope}: ${message}`);
}

export const AccountService = {
  async getProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, role, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      const fallback = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (fallback.error) {
        warn('Could not load profiles', fallback.error);
        return [];
      }

      return (fallback.data || []).map((item) => ({ ...item, phone: null })) as AccountProfile[];
    }

    return (data || []) as AccountProfile[];
  },

  async updateProfile(id: string, payload: Partial<Pick<AccountProfile, 'full_name' | 'phone' | 'role'>>) {
    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', id);

    if (!error) return;

    if ('phone' in payload) {
      const { phone: _phone, ...withoutPhone } = payload;
      const retry = await supabase
        .from('profiles')
        .update(withoutPhone)
        .eq('id', id);

      if (!retry.error) return;
      throw retry.error;
    }

    throw error;
  },

  async getAddresses(userId?: string) {
    let query = supabase
      .from('customer_addresses')
      .select('*')
      .neq('status', 'archived')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query;
    if (error) {
      warn('Could not load customer addresses', error);
      return [];
    }

    return (data || []) as CustomerAddress[];
  },

  async saveAddress(input: AddressInput | CustomerAddress) {
    const record = input as CustomerAddress;
    const { id, created_at: _createdAt, updated_at: _updatedAt, ...payload } = record;

    if (input.id) {
      const { error } = await supabase
        .from('customer_addresses')
        .update(payload)
        .eq('id', input.id);

      if (error) throw error;
      if (payload.is_default) {
        await supabase
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('user_id', payload.user_id)
          .neq('id', input.id);
      }
      return;
    }

    const { data, error } = await supabase
      .from('customer_addresses')
      .insert(payload)
      .select('id')
      .single();

    if (error) throw error;

    if (payload.is_default && data?.id) {
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('user_id', payload.user_id)
        .neq('id', data.id);
    }
  },

  async archiveAddress(id: string) {
    const { error } = await supabase
      .from('customer_addresses')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) throw error;
  },

  async getOrders(userId?: string) {
    let query = supabase
      .from('customer_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query;
    if (error) {
      warn('Could not load customer orders', error);
      return [];
    }

    return (data || []) as CustomerOrder[];
  },

  async updateOrder(id: string, payload: CustomerOrderUpdate) {
    const { error } = await supabase
      .from('customer_orders')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
  },

  async getReturnRequests(userId?: string) {
    let query = supabase
      .from('return_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query;
    if (error) {
      warn('Could not load return requests', error);
      return [];
    }

    return (data || []) as ReturnRequest[];
  },

  async createReturnRequest(input: Pick<ReturnRequest, 'user_id' | 'order_id' | 'reason' | 'message'>) {
    const { error } = await supabase
      .from('return_requests')
      .insert({ ...input, status: 'requested' });

    if (error) throw error;
  },

  async updateReturnRequest(id: string, payload: ReturnRequestUpdate) {
    const { error } = await supabase
      .from('return_requests')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
  },

  async getWishlistItems(userId?: string) {
    let query = supabase
      .from('wishlist_items')
      .select('user_id, product_slug, created_at')
      .order('created_at', { ascending: false });

    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query;
    if (error) {
      warn('Could not load wishlist items', error);
      return [];
    }

    return (data || []) as WishlistItemRow[];
  },

  async getCartItems(userId?: string) {
    let query = supabase
      .from('customer_cart_items')
      .select('user_id, product_slug, quantity, item_snapshot, created_at, updated_at')
      .order('updated_at', { ascending: false });

    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query;
    if (error) {
      warn('Could not load cart items', error);
      return [];
    }

    return (data || []) as CustomerCartItemRow[];
  },

  async upsertCartItem(input: { userId: string; productSlug: string; quantity: number; itemSnapshot: Product | null }) {
    const { error } = await supabase
      .from('customer_cart_items')
      .upsert(
        {
          user_id: input.userId,
          product_slug: input.productSlug,
          quantity: input.quantity,
          item_snapshot: input.itemSnapshot,
        },
        { onConflict: 'user_id,product_slug' }
      );

    if (error) throw error;
  },

  async replaceCartItem(input: { userId: string; oldProductSlug: string; newProductSlug: string; quantity: number; itemSnapshot: Product | null }) {
    if (input.oldProductSlug !== input.newProductSlug) {
      const deleteResult = await supabase
        .from('customer_cart_items')
        .delete()
        .eq('user_id', input.userId)
        .eq('product_slug', input.oldProductSlug);

      if (deleteResult.error) throw deleteResult.error;
    }

    await this.upsertCartItem({
      userId: input.userId,
      productSlug: input.newProductSlug,
      quantity: input.quantity,
      itemSnapshot: input.itemSnapshot,
    });
  },

  async deleteCartItem(userId: string, productSlug: string) {
    const { error } = await supabase
      .from('customer_cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_slug', productSlug);

    if (error) throw error;
  },

  async replaceWishlistItem(input: { userId: string; oldProductSlug: string; newProductSlug: string }) {
    if (input.oldProductSlug !== input.newProductSlug) {
      const deleteResult = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', input.userId)
        .eq('product_slug', input.oldProductSlug);

      if (deleteResult.error) throw deleteResult.error;
    }

    const { error } = await supabase
      .from('wishlist_items')
      .upsert(
        { user_id: input.userId, product_slug: input.newProductSlug },
        { onConflict: 'user_id,product_slug' }
      );

    if (error) throw error;
  },

  async deleteWishlistItem(userId: string, productSlug: string) {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_slug', productSlug);

    if (error) throw error;
  },
};

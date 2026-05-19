/**
 * OrderService — Firestore order read/write for authenticated users.
 *
 * Collection structure:
 *   orders/{orderId}
 *     userId: string
 *     items: CartItem[]
 *     total: number
 *     shippingAddress: Record<string, string>
 *     deliveryMethod: string
 *     deliveryCost: number
 *     promoCode?: string
 *     status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
 *     stripeSessionId?: string
 *     createdAt: Timestamp
 *     updatedAt: Timestamp
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CartItem } from '../types';
import { handleFirestoreError, OperationType } from '../context/AuthContext';

const ORDERS_COLLECTION = 'orders';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  shippingAddress: Record<string, string>;
  deliveryMethod: string;
  deliveryCost: number;
  promoCode?: string;
  status: OrderStatus;
  stripeSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  userId: string;
  items: CartItem[];
  total: number;
  shippingAddress: Record<string, string>;
  deliveryMethod: string;
  deliveryCost: number;
  promoCode?: string;
  stripeSessionId?: string;
}

// Status display helpers
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-gold',
  paid: 'text-crimson',
  processing: 'text-orchid',
  shipped: 'text-gold',
  delivered: 'text-green-600',
  cancelled: 'text-red-500',
};

// ─── Service ─────────────────────────────────────────────────────────────────

export const OrderService = {
  /**
   * Fetch all orders belonging to a specific user, newest first.
   * Falls back to an empty array if Firestore is unreachable.
   */
  async getOrdersByUser(userId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
        } as Order;
      });
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.LIST, ORDERS_COLLECTION);
      } catch {
        // error already logged by handleFirestoreError
      }
      return [];
    }
  },

  /**
   * Create a new order document in Firestore.
   * Returns the new Firestore document ID.
   */
  async createOrder(input: CreateOrderInput): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
        ...input,
        status: 'pending' as OrderStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, ORDERS_COLLECTION);
      throw error; // re-throw so callers can handle UI feedback
    }
  },

  /**
   * Update an order's status (called after Stripe webhook confirms payment).
   * In Phase 3 this is called client-side after mock success;
   * in Phase 4+ it will be called server-side via the webhook handler.
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
    }
  },
};

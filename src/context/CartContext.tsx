import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';
import { AccountService, CustomerCartItemRow } from '../services/AccountService';
import { supabase } from '../lib/supabase';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const remoteLoadedForUser = useRef<string | null>(null);
  const savingRemote = useRef(false);
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const clearLocalCart = () => setItems([]);

    window.addEventListener('cee-clear-local-cart', clearLocalCart);
    return () => window.removeEventListener('cee-clear-local-cart', clearLocalCart);
  }, []);

  const cartRowsToItems = (rows: CustomerCartItemRow[]): CartItem[] => {
    return rows
      .map((row) => {
        if (!row.item_snapshot) {
          return {
            id: row.product_slug,
            name: row.product_slug,
            variant: 'Saved bag item',
            price: 0,
            image: '',
            colors: [],
            category: '',
            quantity: row.quantity,
          } as CartItem;
        }

        return {
          ...row.item_snapshot,
          id: row.item_snapshot.id || row.product_slug,
          quantity: row.quantity,
        };
      })
      .filter((item) => item.quantity > 0);
  };

  const loadRemoteCart = async (userId: string) => {
    const rows = await AccountService.getCartItems(userId);
    const remoteItems = cartRowsToItems(rows);

    if (remoteItems.length > 0) {
      setItems(remoteItems);
      remoteLoadedForUser.current = userId;
      return;
    }

    remoteLoadedForUser.current = userId;

    setItems([]);
  };

  useEffect(() => {
    if (!user) {
      remoteLoadedForUser.current = null;
      setItems([]);
      return;
    }

    void loadRemoteCart(user.id);

    const refresh = () => {
      if (document.visibilityState === 'visible') void loadRemoteCart(user.id);
    };

    const channel = supabase
      .channel(`customer-cart-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_cart_items',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          if (!savingRemote.current) void loadRemoteCart(user.id);
        }
      )
      .subscribe();

    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);

    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user || remoteLoadedForUser.current !== user.id) return;

    const sync = async () => {
      savingRemote.current = true;
      const remoteRows = await AccountService.getCartItems(user.id);
      const currentIds = new Set(items.map((item) => item.id));
      const deletes = remoteRows
        .filter((row) => !currentIds.has(row.product_slug))
        .map((row) => AccountService.deleteCartItem(user.id, row.product_slug));
      const upserts = items.map((item) => AccountService.upsertCartItem({
        userId: user.id,
        productSlug: item.id,
        quantity: item.quantity,
        itemSnapshot: item,
      }));

      await Promise.all([...deletes, ...upserts]);
      savingRemote.current = false;
    };

    void sync().catch((error) => {
      savingRemote.current = false;
      console.warn('[Supabase] Could not sync cart', error);
    });
  }, [items, user?.id]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(i => i.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}

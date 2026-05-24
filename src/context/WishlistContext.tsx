import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface WishlistContextValue {
  productIds: string[];
  loading: boolean;
  isWishlisted: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

function uniqueProductIds(ids: string[]) {
  return Array.from(new Set(ids.filter(Boolean)));
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshWishlist = async () => {
    if (!user) {
      setProductIds([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('wishlist_items')
      .select('product_slug')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Could not load wishlist', error.message);
      setProductIds([]);
      setLoading(false);
      return;
    }

    setProductIds(uniqueProductIds((data || []).map((item) => String(item.product_slug))));
    setLoading(false);
  };

  useEffect(() => {
    refreshWishlist();
  }, [user?.id]);

  const addToWishlist = async (productId: string) => {
    if (!user) return;

    setProductIds((current) => uniqueProductIds([productId, ...current]));

    const { error } = await supabase
      .from('wishlist_items')
      .upsert(
        { user_id: user.id, product_slug: productId },
        { onConflict: 'user_id,product_slug' }
      );

    if (error) {
      await refreshWishlist();
      throw error;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    setProductIds((current) => current.filter((id) => id !== productId));

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_slug', productId);

    if (error) {
      await refreshWishlist();
      throw error;
    }
  };

  const isWishlisted = (productId: string) => productIds.includes(productId);

  const toggleWishlist = async (productId: string) => {
    if (isWishlisted(productId)) {
      await removeFromWishlist(productId);
      return;
    }

    await addToWishlist(productId);
  };

  const value = useMemo(
    () => ({
      productIds,
      loading,
      isWishlisted,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      refreshWishlist,
    }),
    [productIds, loading, user?.id]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}

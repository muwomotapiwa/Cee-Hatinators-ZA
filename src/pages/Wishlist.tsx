import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { SafeImage } from '../components/SafeImage';
import { Product } from '../types';
import { ProductService } from '../services/ProductService';
import { formatMoney } from '../lib/money';

export function WishlistPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { productIds, loading: wishlistLoading, removeFromWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    ProductService.getProducts().then((data) => {
      setProducts(data);
      setLoadingProducts(false);
    });
  }, []);

  const wishlistProducts = useMemo(
    () => productIds
      .map((productId) => products.find((product) => product.id === productId))
      .filter((product): product is Product => Boolean(product)),
    [productIds, products]
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <Heart size={40} className="mx-auto mb-6 text-mid-gray" />
          <h2 className="serif text-3xl font-light text-dark mb-4">Sign In to View Wishlist</h2>
          <p className="text-[13px] text-charcoal font-light mb-8">Your saved items will appear here once you sign in.</p>
          <button onClick={() => navigate('/')} className="text-[11px] tracking-[2px] uppercase text-crimson border-b border-crimson pb-0.5">Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-offwhite min-h-screen py-12 sm:py-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        <div className="mb-12 sm:mb-16 text-center">
          <span className="text-[10px] tracking-[3px] uppercase text-crimson mb-3 block">Saved Items</span>
          <h1 className="serif text-[clamp(32px,5vw,52px)] font-light text-dark leading-[1.1]">
            My <em className="italic text-crimson">Wishlist</em>
          </h1>
          <div className="w-10 h-px bg-crimson mx-auto mt-5" />
        </div>

        {wishlistLoading || loadingProducts ? (
          <div className="py-20 text-center text-[10px] tracking-[2px] uppercase text-mid-gray">
            Loading wishlist...
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="mx-auto mb-6 text-mid-gray" />
            <p className="text-[13px] text-charcoal font-light mb-8">You haven't saved any items yet.</p>
            <Link to="/shop" className="inline-block bg-crimson text-white px-8 py-3 text-[10px] tracking-[2px] uppercase hover:bg-crimson-dark transition-colors">
              Browse Collection
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {wishlistProducts.map((product) => (
                <div key={product.id} className="group bg-white border border-silver hover:border-charcoal transition-all duration-300">
                  <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-offwhite">
                    <SafeImage
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.badge && (
                      <span className={`absolute top-3 left-3 px-2.5 py-1 text-[9px] tracking-[1.5px] uppercase font-semibold
                        ${product.badgeVariant === 'sale' ? 'bg-crimson text-white' : product.badgeVariant === 'dark' ? 'bg-dark text-white' : 'bg-gold text-crimson-dark'}`}>
                        {product.badge}
                      </span>
                    )}
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="serif text-[15px] font-normal text-dark mb-1 leading-tight hover:text-crimson transition-colors">{product.name}</h3>
                    </Link>
                    <p className="text-[10px] tracking-[1.5px] text-mid-gray uppercase mb-3">{product.variant}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[15px] font-medium text-crimson">{formatMoney(product.price)}</span>
                        {product.oldPrice && <span className="text-[12px] text-silver line-through">{formatMoney(product.oldPrice)}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-silver">
                      <button
                        onClick={() => addToCart(product)}
                        className="flex-1 flex items-center justify-center gap-2 bg-crimson text-white py-2.5 text-[10px] tracking-[1.5px] uppercase hover:bg-crimson-dark transition-colors"
                      >
                        <ShoppingBag size={13} /> Add to Bag
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product.id)}
                        className="w-10 flex items-center justify-center border border-silver text-mid-gray hover:border-crimson hover:text-crimson transition-colors"
                        aria-label={`Remove ${product.name} from wishlist`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/shop" className="text-[11px] tracking-[2px] uppercase text-charcoal border-b border-silver pb-0.5 hover:text-crimson hover:border-crimson transition-colors">
                Continue Shopping -&gt;
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

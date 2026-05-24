import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductService } from '../services/ProductService';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { ProductColorImage } from '../components/ProductColorImage';
import { ChevronRight, Heart, Share2, Ruler, Truck, ShieldCheck, Plus, Minus } from 'lucide-react';
import { formatMoney } from '../lib/money';

export function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState('');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    // In a real app, you'd fetch a single product by slug or ID
    ProductService.getProducts().then(products => {
      // Find by ID, matching the slug param
      const found = products.find(p => p.id === slug) || products[0]; 
      setProduct(found);
      setRelatedProducts(products.filter(p => p.id !== found.id && p.category === found.category));
      if (found.colors && found.colors.length > 0) setSelectedColor(found.colors[0]);
      setSelectedImage(found.image);
      if (found.sizes && found.sizes.length > 0) setSelectedSize(found.sizes[0]);
      setLoading(false);
    });
  }, [slug]);

  if (loading || !product) {
    return <div className="py-32 text-center text-[11px] tracking-[2px] uppercase text-mid-gray">Loading product...</div>;
  }

  const handleAddToCart = () => {
    // Ideally addToCart supports quantity, here we might call it multiple times or update context
    for(let i=0; i<quantity; i++) {
      addToCart(product);
    }
    // Optionally open cart here
  };

  const saved = isWishlisted(product.id);

  const handleWishlistClick = async () => {
    if (!user) {
      navigate('/login?redirect=/wishlist');
      return;
    }

    await toggleWishlist(product.id);
  };
  const thumbnailImages = (product.galleryImages || []).slice(0, 4);

  return (
    <div className="bg-offwhite min-h-screen">
      {/* Breadcrumbs */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-6">
        <nav className="flex items-center gap-2 text-[10px] sm:text-[11px] tracking-[1px] text-mid-gray uppercase">
          <Link to="/" className="hover:text-crimson transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-crimson transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <Link to={`/shop?category=${product.category}`} className="hover:text-crimson transition-colors">{product.category}</Link>
          <ChevronRight size={12} />
          <span className="text-charcoal truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="aspect-[4/5] bg-white w-full overflow-hidden relative group cursor-crosshair">
              {product.badge && (
                <div className={`absolute top-4 left-4 z-10 px-3 py-1 text-[9px] tracking-[1.5px] uppercase font-semibold
                  ${product.badgeVariant === 'sale' ? 'bg-crimson text-white' : 
                    product.badgeVariant === 'dark' ? 'bg-dark text-white' : 
                    'bg-gold text-crimson-dark'}`}
                >
                  {product.badge}
                </div>
              )}
              <ProductColorImage
                src={selectedImage || product.image}
                alt={product.name}
                color={selectedColor}
                className="w-full h-full"
                imageClassName="transition-transform duration-500 group-hover:scale-110 origin-center"
              />
            </div>
            {/* Thumbnail Gallery */}
            {thumbnailImages.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {thumbnailImages.map((imageUrl, index) => (
                  <button
                    key={`${imageUrl}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(imageUrl)}
                    className={`aspect-square bg-white overflow-hidden cursor-pointer transition-all ${
                      selectedImage === imageUrl ? 'border border-crimson' : 'border border-transparent hover:border-silver opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View ${product.name} angle ${index + 1}`}
                  >
                    <ProductColorImage src={imageUrl} className="w-full h-full" imageClassName="object-cover" color={selectedColor} alt={`${product.name} angle ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="py-4 lg:py-10 flex flex-col h-full">
            <div className="mb-8">
              <span className="text-[10px] tracking-[3px] uppercase text-crimson mb-3 block">{product.variant || product.category}</span>
              <h1 className="serif text-[clamp(28px,3vw,42px)] font-light leading-[1.1] text-dark mb-4">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-4">
                <span className="text-xl sm:text-2xl font-light text-dark">{formatMoney(product.price)}</span>
                {product.oldPrice && (
                  <span className="text-sm text-mid-gray line-through">{formatMoney(product.oldPrice)}</span>
                )}
              </div>
            </div>

            <div className="text-[13px] leading-[1.8] text-charcoal font-light mb-8">
              {product.description || "Crafted with premium occasion styling in mind. This piece blends sculptural shape, confident colour, and polished detail for elegant entrances."}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] tracking-[1.5px] uppercase text-dark font-medium">Color</span>
                </div>
                <div className="flex gap-3">
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${selectedColor === color ? 'border-dark scale-110' : 'border-transparent hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                      aria-label="Select color"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes (If applicable) */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] tracking-[1.5px] uppercase text-dark font-medium">Size</span>
                  <button className="flex items-center gap-1.5 text-[10px] tracking-[1px] uppercase text-mid-gray hover:text-crimson transition-colors">
                    <Ruler size={12} /> Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-10 flex items-center justify-center text-[11px] tracking-[1px] uppercase border transition-all duration-200 ${selectedSize === size ? 'border-dark bg-dark text-white' : 'border-silver text-charcoal hover:border-dark'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex items-center border border-silver h-12 w-full sm:w-[120px] shrink-0">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex justify-center items-center text-charcoal hover:text-crimson"><Minus size={14} /></button>
                <input type="number" value={quantity} readOnly className="w-full text-center text-[13px] bg-transparent outline-none" />
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex justify-center items-center text-charcoal hover:text-crimson"><Plus size={14} /></button>
              </div>
              <Button onClick={handleAddToCart} variant="primary" className="h-12 flex-1">
                Add to Bag - {formatMoney(product.price * quantity)}
              </Button>
              <button
                type="button"
                className={`h-12 w-12 shrink-0 border border-silver flex items-center justify-center hover:border-crimson hover:text-crimson transition-colors ${
                  saved ? 'text-crimson' : 'text-charcoal'
                }`}
                title={saved ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-label={`${saved ? 'Remove' : 'Add'} ${product.name} ${saved ? 'from' : 'to'} wishlist`}
                onClick={handleWishlistClick}
              >
                <Heart size={18} className={saved ? 'fill-current' : ''} />
              </button>
            </div>

            <div className="mb-10 p-5 bg-[#f4eef5] text-[12px] text-charcoal tracking-[0.5px] leading-[1.9]">
              <strong className="text-crimson text-[10px] tracking-[2px] uppercase block mb-2">Styling Note</strong>
              {product.stylingNote || 'Pair purple-led pieces with blush, champagne, ivory, soft metallics, or deep plum for a polished finish.'}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 border-t border-silver pt-8 mt-auto">
              <div className="flex gap-3">
                <Truck size={20} className="text-crimson shrink-0" />
                <div>
                  <h4 className="text-[11px] tracking-[1px] uppercase font-semibold text-dark mb-1">Careful Packing</h4>
                  <p className="text-[11px] text-mid-gray">Prepared for occasion wear</p>
                </div>
              </div>
              <div className="flex gap-3">
                <ShieldCheck size={20} className="text-crimson shrink-0" />
                <div>
                  <h4 className="text-[11px] tracking-[1px] uppercase font-semibold text-dark mb-1">Authentic Quality</h4>
                  <p className="text-[11px] text-mid-gray">100% premium materials</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 pb-24 border-t border-silver pt-16 mt-10">
          <div className="text-center mb-12">
            <h2 className="serif text-[clamp(24px,3vw,36px)] font-light text-dark leading-[1.1]">
              You May Also <em className="italic text-crimson">Like</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-10">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onQuickAdd={() => addToCart(p)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

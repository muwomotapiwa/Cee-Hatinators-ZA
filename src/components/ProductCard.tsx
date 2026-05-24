import React from 'react';
import { Heart, Plus } from 'lucide-react';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';
import { ProductColorImage } from './ProductColorImage';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { formatMoney } from '../lib/money';

interface ProductCardProps {
  product: Product;
  onQuickAdd?: (id: string) => void;
  onClick?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickAdd, onClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [selectedColor, setSelectedColor] = React.useState(product.colors[0] || '');
  const saved = isWishlisted(product.id);
  const badgeColors = {
    sale: 'bg-gold text-crimson-dark',
    dark: 'bg-dark text-white',
    default: 'bg-crimson text-white',
  };

  React.useEffect(() => {
    setSelectedColor(product.colors[0] || '');
  }, [product.id, product.colors]);

  const handleWishlistClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!user) {
      navigate('/login?redirect=/wishlist');
      return;
    }

    await toggleWishlist(product.id);
  };

  return (
    <div className="group cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f4eef5] mb-4">
        <ProductColorImage
          src={product.image}
          alt={product.name}
          color={selectedColor}
          className="w-full h-full"
          imageClassName="transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {product.badge && (
          <span className={`absolute top-3 left-3 text-[9px] tracking-[2px] uppercase px-2.5 py-1.5 font-semibold ${badgeColors[product.badgeVariant || 'default']}`}>
            {product.badge}
          </span>
        )}

        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
          <button
            type="button"
            className={`w-9 h-9 bg-white border-0 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-crimson hover:text-white ${
              saved ? 'text-crimson' : 'text-dark'
            }`}
            title={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-label={`${saved ? 'Remove' : 'Add'} ${product.name} ${saved ? 'from' : 'to'} wishlist`}
            onClick={handleWishlistClick}
          >
            <Heart size={14} className={saved ? 'fill-current' : ''} />
          </button>
          <button
            className="w-9 h-9 bg-white border-0 flex items-center justify-center cursor-pointer text-dark transition-all duration-200 hover:bg-crimson hover:text-white"
            title="Quick view"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(product.id);
            }}
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          className="absolute bottom-0 left-0 right-0 bg-crimson text-white border-none p-3 font-sans text-[10px] tracking-[2px] uppercase cursor-pointer lg:translate-y-full transition-transform duration-300 group-hover:translate-y-0"
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd?.(product.id);
          }}
        >
          Add to Bag
        </button>
      </div>

      <h3 className="serif text-lg font-normal text-dark mb-1 leading-[1.3]">{product.name}</h3>
      <p className="text-[10px] tracking-[1.5px] text-mid-gray uppercase mb-2.5">{product.variant}</p>

      <div className="flex items-center gap-2.5">
        <span className="text-[15px] font-medium text-crimson tracking-[0.5px]">{formatMoney(product.price)}</span>
        {product.oldPrice && (
          <span className="text-[13px] text-silver line-through">{formatMoney(product.oldPrice)}</span>
        )}
      </div>

      <div className="flex gap-1.5 mt-2.5">
        {product.colors.map((color, i) => (
          <button
            key={i}
            type="button"
            className={`w-3 h-3 rounded-full border cursor-pointer transition-transform duration-150 hover:scale-[1.3] ${selectedColor === color ? 'border-dark scale-[1.2]' : 'border-silver'}`}
            style={{ backgroundColor: color }}
            aria-label={`Select ${product.name} color ${i + 1}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedColor(color);
            }}
          />
        ))}
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { X, Heart, Minus, Plus } from 'lucide-react';
import { Button } from './Button';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ProductColorImage } from './ProductColorImage';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    setSelectedColor(product?.colors[0] || '');
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-crimson-dark/70" />

      <button
        className="absolute top-4 right-4 bg-white border-none w-9 h-9 cursor-pointer text-dark flex items-center justify-center z-[201]"
        onClick={onClose}
      >
        <X size={18} />
      </button>

      <div
        className="relative bg-offwhite max-w-[900px] w-full max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#f4eef5] aspect-[4/3] md:aspect-auto">
          <ProductColorImage src={product.image} alt={product.name} color={selectedColor} className="w-full h-full" imageClassName="block" />
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <p className="text-[10px] tracking-[2px] text-mid-gray uppercase mb-3">SKU: {product.id.padStart(7, '0')}</p>
          <h2 className="serif text-3xl sm:text-4xl font-normal text-dark leading-[1.2] mb-3 sm:mb-4">{product.name}</h2>
          <p className="text-xl sm:text-2xl font-medium text-crimson mb-5 sm:mb-6 tracking-[0.5px]">GBP {product.price.toFixed(2)}</p>

          <p className="text-[12px] leading-[1.8] text-charcoal tracking-[0.5px] mb-3 font-light">
            {product.description || `An elegant Cee Hatinators ${product.category.toLowerCase()} designed to finish your occasion look with colour, height, and polish.`}
          </p>

          <div className="text-[10px] tracking-[2px] uppercase text-mid-gray mt-5 mb-2.5">Colour</div>
          <div className="flex gap-1.5 mb-4">
            {product.colors.map((color, i) => (
              <button
                key={i}
                type="button"
                className={`w-5 h-5 rounded-full border-2 transition-all ${selectedColor === color ? 'border-crimson scale-110' : 'border-transparent hover:scale-110'}`}
                style={{ backgroundColor: color }}
                aria-label={`Select ${product.name} color ${i + 1}`}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>

          <div className="text-[10px] tracking-[2px] uppercase text-mid-gray mt-5 mb-2.5">Quantity</div>
          <div className="flex gap-3 items-center mb-5">
            <div className="flex items-center border border-silver">
              <button
                className="w-9 h-9 bg-transparent border-none cursor-pointer text-charcoal flex items-center justify-center hover:bg-silver/30"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >
                <Minus size={14} />
              </button>
              <input
                className="w-10 text-center text-sm text-dark font-medium border-none outline-none bg-transparent"
                value={quantity}
                readOnly
              />
              <button
                className="w-9 h-9 bg-transparent border-none cursor-pointer text-charcoal flex items-center justify-center hover:bg-silver/30"
                onClick={() => setQuantity(q => q + 1)}
              >
                <Plus size={14} />
              </button>
            </div>
            <span className="text-[11px] text-mid-gray tracking-[1px]">Final styling confirmed before dispatch</span>
          </div>

          <Button variant="crimson" className="w-full mb-3" onClick={handleAddToCart}>
            Add to Bag - GBP {(product.price * quantity).toFixed(2)}
          </Button>
          <button className="w-full p-[15px] bg-transparent text-dark border border-silver font-sans text-[11px] tracking-[3px] uppercase cursor-pointer transition-all hover:border-crimson hover:text-crimson flex items-center justify-center gap-2">
            <Heart size={14} /> Add to Wishlist
          </button>

          <div className="mt-5 p-4 bg-[#f4eef5] text-[11px] text-charcoal tracking-[0.5px] leading-[1.8]">
            <strong className="text-crimson text-[10px] tracking-[2px] uppercase block mb-2">Styling Note</strong>
            Pair purple-led pieces with blush, champagne, ivory, soft metallics, or deep plum for a polished finish.
          </div>
        </div>
      </div>
    </div>
  );
}

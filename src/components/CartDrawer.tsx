import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { CartItem } from '../types';
import { SafeImage } from './SafeImage';
import { formatMoney } from '../lib/money';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
}

export function CartDrawer({ isOpen, onClose, items }: CartDrawerProps) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-crimson-dark/70 z-[300] backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-offwhite z-[400] flex flex-col shadow-[-8px_0_32px_rgba(0,0,0,0.15)] transition-transform duration-400 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 px-7 border-b border-silver flex justify-between items-center">
          <span className="text-[11px] tracking-[3px] uppercase text-dark font-medium">Your Bag ({items.length})</span>
          <button className="bg-transparent border-none text-xl cursor-pointer text-charcoal w-8 h-8 flex items-center justify-center hover:text-crimson" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-7 py-5">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[72px_1fr] gap-4 py-4 border-b border-silver">
              <SafeImage src={item.image} alt={item.name} className="w-[72px] h-[90px] object-cover" />
              <div>
                <div className="serif text-base text-dark mb-1">{item.name}</div>
                <div className="text-[11px] color-mid-gray tracking-[1px] mb-2">{item.category} / {item.variant}</div>
                <div className="text-sm text-crimson font-medium">{formatMoney(item.price)}</div>
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-10">
              <span className="serif text-4xl mb-4 opacity-20">C</span>
              <p className="text-sm text-mid-gray">Your bag is empty.</p>
            </div>
          )}
          
          <div className="text-center py-5 text-[11px] text-mid-gray tracking-[1px]">
            Every piece is packed with care for its occasion.
          </div>
        </div>
        
        <div className="p-6 px-7 border-t border-silver bg-white">
          <div className="flex justify-between mb-5">
            <span className="text-[11px] tracking-[2px] uppercase text-charcoal">Subtotal</span>
            <span className="serif text-[22px] text-crimson">{formatMoney(subtotal)}</span>
          </div>
          <Link to="/checkout" onClick={onClose} className="block">
            <button className="w-full p-[18px] bg-crimson-dark text-white border-none font-sans text-[11px] tracking-[3px] uppercase cursor-pointer transition-colors duration-200 font-semibold hover:bg-crimson">
              Proceed to Checkout
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}

import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { Button } from './Button';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import { useProductModal } from '../context/ProductModalContext';
import { ProductService } from '../services/ProductService';
import { useNavigate } from 'react-router-dom';
import { SupabaseCatalogService, CategoryTileRecord } from '../services/SupabaseCatalogService';
import { useContentBlock } from '../hooks/useContentBlock';

export function ProductGrid() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryTileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { searchQuery } = useSearch();
  const { openProductModal } = useProductModal();
  const navigate = useNavigate();
  const content = useContentBlock('home', 'products_heading', {
    title: 'New Headwear',
    subtitle: 'Cee Selection',
    body: '',
    media_url: null,
    button_label: null,
    button_url: null,
  });
  const filters = ['All', ...categories.map((category) => category.name)];

  useEffect(() => {
    Promise.all([
      ProductService.getProducts(),
      SupabaseCatalogService.getCategories(),
    ]).then(([productData, categoryData]) => {
      setProducts(productData);
      setCategories(categoryData);
      setLoading(false);
    });
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesFilter = activeFilter === 'All' || p.category === activeFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.variant.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="py-20 text-center text-[10px] tracking-[2px] uppercase text-mid-gray">
        Loading arrivals...
      </div>
    );
  }

  return (
    <section id="products" className="py-12 sm:py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] uppercase text-crimson mb-2 sm:mb-3 block">{content.subtitle}</span>
          <h2 className="serif text-[clamp(28px,4vw,52px)] font-light text-dark leading-[1.1]">
            {content.title}
          </h2>
          <div className="w-10 sm:w-12 h-px bg-crimson mx-auto mt-4 sm:mt-5"></div>
        </div>
        
        <div className="flex gap-1.5 sm:gap-2 justify-center mb-10 sm:mb-12 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 sm:px-5 py-1.5 sm:py-2 font-sans text-[9px] sm:text-[10px] tracking-[1px] sm:tracking-[2px] uppercase border transition-all duration-200 cursor-pointer ${
                activeFilter === filter 
                ? 'bg-crimson border-crimson text-white' 
                : 'bg-transparent border-silver text-charcoal hover:bg-crimson hover:border-crimson hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-10">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product as Product} 
              onClick={() => openProductModal(product as Product)}
              onQuickAdd={() => addToCart(product as Product)}
            />
          ))}
        </div>
        
        <div className="text-center mt-14">
          <Button 
            variant="ghost" 
            className="text-crimson border-crimson hover:bg-crimson hover:text-white"
            onClick={() => navigate('/shop')}
          >
            View All Headwear
          </Button>
        </div>
      </div>
    </section>
  );
}

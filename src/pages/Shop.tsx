import { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import { useProductModal } from '../context/ProductModalContext';
import { ProductService } from '../services/ProductService';
import { useLocation } from 'react-router-dom';

const OCCASION_TYPES = ['Wedding', 'Church', 'Race Day', 'Formal Event', 'Evening'];

function productMatchesOccasion(product: Product, occasionType: string) {
  const searchableText = `${product.name} ${product.variant} ${product.category}`.toLowerCase();

  if (occasionType === 'Formal Event') {
    return searchableText.includes('hatinator') || searchableText.includes('fascinator');
  }

  if (occasionType === 'Race Day') {
    return searchableText.includes('fascinator') || searchableText.includes('wide brim');
  }

  return searchableText.includes(occasionType.toLowerCase());
}

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { searchQuery } = useSearch();
  const { openProductModal } = useProductModal();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedOccasionTypes, setSelectedOccasionTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  const categories = ['All', 'Hatinators', 'Fascinators', 'Church Hats', 'Bonnets', 'Accessories'];

  useEffect(() => {
    window.scrollTo(0, 0);
    ProductService.getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const category = new URLSearchParams(location.search).get('category') || 'All';
    setActiveCategory(category);
  }, [location.search]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === 'All') setSelectedOccasionTypes([]);
  };

  const toggleOccasionType = (occasionType: string) => {
    setSelectedOccasionTypes(current =>
      current.includes(occasionType)
        ? current.filter(type => type !== occasionType)
        : [...current, occasionType]
    );
  };

  let filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.variant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOccasionType = selectedOccasionTypes.length === 0 ||
      selectedOccasionTypes.some(type => productMatchesOccasion(p, type));
    return matchesCategory && matchesSearch && matchesOccasionType;
  });

  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="bg-offwhite min-h-screen py-10 sm:py-16">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        <div className="mb-10 sm:mb-14 text-center sm:text-left flex flex-col sm:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="serif text-[clamp(32px,5vw,56px)] font-light text-dark leading-[1.1] mb-2 sm:mb-4">
              Shop <em className="italic text-crimson">Cee Hatinators</em>
            </h1>
            <p className="text-[12px] sm:text-[13px] tracking-[1px] text-charcoal max-w-lg font-light">
              Explore elegant hatinators, fascinators, bonnets, and finishing accessories for memorable occasions.
            </p>
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-[10px] tracking-[2px] uppercase text-mid-gray shrink-0">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border border-silver text-[11px] tracking-[1px] text-charcoal py-2 px-3 outline-none w-full sm:w-[160px] focus:border-crimson"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="best-selling">Best Selling</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          <aside className="w-full lg:w-[220px] shrink-0">
            <div className="sticky top-28">
              <h3 className="text-[11px] tracking-[2px] uppercase text-dark mb-5 font-semibold border-b border-silver pb-3">Categories</h3>
              <ul className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
                {categories.map(cat => (
                  <li key={cat} className="shrink-0">
                    <button
                      onClick={() => handleCategoryChange(cat)}
                      className={`text-[12px] tracking-[1px] transition-colors ${
                        activeCategory === cat ? 'text-crimson font-medium' : 'text-charcoal hover:text-crimson'
                      }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="hidden lg:block mt-10">
                <h3 className="text-[11px] tracking-[2px] uppercase text-dark mb-5 font-semibold border-b border-silver pb-3">Occasion</h3>
                <ul className="flex flex-col gap-3">
                  {OCCASION_TYPES.map(type => (
                    <li key={type}>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedOccasionTypes.includes(type)}
                          onChange={() => toggleOccasionType(type)}
                          className="w-3.5 h-3.5 accent-crimson cursor-pointer"
                        />
                        <span className="text-[12px] tracking-[1px] text-charcoal group-hover:text-crimson transition-colors">{type}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="py-20 text-center text-[10px] tracking-[2px] uppercase text-mid-gray">
                Loading collection...
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-10 sm:gap-y-12">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product as Product}
                    onClick={() => openProductModal(product as Product)}
                    onQuickAdd={() => addToCart(product as Product)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-charcoal text-[13px] tracking-[1px]">
                No products found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

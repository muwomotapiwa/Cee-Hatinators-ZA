import { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import { useProductModal } from '../context/ProductModalContext';
import { ProductService } from '../services/ProductService';
import { useLocation } from 'react-router-dom';
import { SupabaseCatalogService, CategoryTileRecord, OccasionOption } from '../services/SupabaseCatalogService';

function productMatchesOccasion(product: Product, occasionType: string) {
  if (product.occasions) {
    return product.occasions.some((occasion) => occasion.toLowerCase() === occasionType.toLowerCase());
  }

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
  const [categories, setCategories] = useState<CategoryTileRecord[]>([]);
  const [occasions, setOccasions] = useState<OccasionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();
  const { openProductModal } = useProductModal();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All';
  const initialCollection = queryParams.get('collection') || '';
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeCollection, setActiveCollection] = useState(initialCollection);
  const [selectedOccasionTypes, setSelectedOccasionTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  const categoryFilters = ['All', ...categories.map((category) => category.name)];

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      ProductService.getProducts(),
      SupabaseCatalogService.getCategories(),
      SupabaseCatalogService.getOccasions(),
    ]).then(([productData, categoryData, occasionData]) => {
      setProducts(productData);
      setCategories(categoryData);
      setOccasions(occasionData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    const category = currentParams.get('category') || 'All';
    const collection = currentParams.get('collection') || '';
    const search = currentParams.get('search') || '';
    setActiveCategory(category);
    setActiveCollection(collection);
    setSearchQuery(search);
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
    const hasCollectionAssignments = products.some((product) => (product.collectionSlugs || []).length > 0);
    const matchesCollection = !activeCollection ||
      !hasCollectionAssignments ||
      (p.collectionSlugs || []).some((slug) => slug.toLowerCase() === activeCollection.toLowerCase());
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const matchesSearch = !normalizedSearch ||
      p.name.toLowerCase().includes(normalizedSearch) ||
      p.variant.toLowerCase().includes(normalizedSearch) ||
      p.category.toLowerCase().includes(normalizedSearch) ||
      (p.collectionSlugs || []).some((slug) => slug.toLowerCase().includes(normalizedSearch)) ||
      (p.description || '').toLowerCase().includes(normalizedSearch);
    const matchesOccasionType = selectedOccasionTypes.length === 0 ||
      selectedOccasionTypes.some(type => productMatchesOccasion(p, type));
    return matchesCategory && matchesCollection && matchesSearch && matchesOccasionType;
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
              {searchQuery.trim() ? (
                <>
                  Search <em className="italic text-crimson">Results</em>
                </>
              ) : (
                <>
                  Shop <em className="italic text-crimson">Cee Hatinators</em>
                </>
              )}
            </h1>
            <p className="text-[12px] sm:text-[13px] tracking-[1px] text-charcoal max-w-lg font-light">
              {searchQuery.trim()
                ? `Showing pieces that match "${searchQuery.trim()}".`
                : 'Explore elegant hatinators, fascinators, veilings, and finishing accessories for memorable occasions.'}
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
                {categoryFilters.map(cat => (
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
                  {occasions.map((occasion) => (
                    <li key={occasion.id}>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedOccasionTypes.includes(occasion.name)}
                          onChange={() => toggleOccasionType(occasion.name)}
                          className="w-3.5 h-3.5 accent-crimson cursor-pointer"
                        />
                        <span className="text-[12px] tracking-[1px] text-charcoal group-hover:text-crimson transition-colors">{occasion.name}</span>
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

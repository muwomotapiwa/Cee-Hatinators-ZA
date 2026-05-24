import { useEffect, useState } from 'react';
import { CategoryTile } from './CategoryTile';
import { Product } from '../types';
import { SupabaseCatalogService, CategoryTileRecord } from '../services/SupabaseCatalogService';
import { useContentBlock } from '../hooks/useContentBlock';

export function CategoryGrid() {
  const [categories, setCategories] = useState<CategoryTileRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const content = useContentBlock('home', 'categories_heading', {
    title: 'Find Your Perfect Piece',
    subtitle: 'Browse by Category',
    body: '',
    media_url: null,
    button_label: null,
    button_url: null,
  });

  useEffect(() => {
    Promise.all([
      SupabaseCatalogService.getCategories(),
      SupabaseCatalogService.getProducts(),
    ]).then(([categoryData, productData]) => {
      setCategories(categoryData);
      setProducts(productData);
    });
  }, []);

  return (
    <section id="categories" className="py-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        <div className="text-center mb-10 sm:mb-12">
          <span className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] uppercase text-crimson mb-2 sm:mb-3 block">{content.subtitle}</span>
          <h2 className="serif text-[clamp(28px,4vw,52px)] font-light text-dark leading-[1.1]">
            {content.title}
          </h2>
          <div className="w-10 sm:w-12 h-px bg-crimson mx-auto mt-4 sm:mt-5"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0.5 sm:gap-1">
          {categories.map((cat) => (
            <CategoryTile key={cat.id} category={cat} previewProducts={products} />
          ))}
        </div>
      </div>
    </section>
  );
}

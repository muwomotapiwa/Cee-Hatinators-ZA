import { useEffect, useState } from 'react';
import { CategoryTile } from '../components/CategoryTile';
import { Product } from '../types';
import { SupabaseCatalogService, CategoryTileRecord } from '../services/SupabaseCatalogService';

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryTileRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

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
    <div className="bg-offwhite min-h-screen py-16 sm:py-24">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        <div className="text-center mb-16">
          <h1 className="serif text-[clamp(36px,5vw,64px)] font-light text-dark leading-[1.1]">
            Shop by <em className="italic text-crimson">Category</em>
          </h1>
          <div className="w-12 h-px bg-crimson mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((cat) => (
            <CategoryTile key={cat.id} category={cat} layout="page" previewProducts={products} />
          ))}
        </div>
      </div>
    </div>
  );
}

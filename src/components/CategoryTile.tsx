import type { FC, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../lib/mockData';
import { getShopCategoryForCategoryTile, getShopPathForCategoryTile } from '../lib/categoryRoutes';
import { useProductModal } from '../context/ProductModalContext';
import { SafeImage } from './SafeImage';
import type { Product } from '../types';

interface CategoryTileData {
  id: string;
  name: string;
  label: string;
  count: string;
  image: string;
  featured?: boolean;
}

interface CategoryTileProps {
  category: CategoryTileData;
  layout?: 'home' | 'page';
  previewProducts?: Product[];
}

function getPreviewProductForCategory(categoryName: string, products: Product[]) {
  const shopCategory = getShopCategoryForCategoryTile(categoryName);
  return (
    products.find((product) => product.category.toLowerCase() === shopCategory.toLowerCase()) ||
    products[0]
  );
}

export const CategoryTile: FC<CategoryTileProps> = ({ category, layout = 'home', previewProducts = MOCK_PRODUCTS }) => {
  const { openProductModal } = useProductModal();
  const previewProduct = getPreviewProductForCategory(category.name, previewProducts);
  const isHomeLayout = layout === 'home';

  const handleViewClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (previewProduct) openProductModal(previewProduct);
  };

  return (
    <div
      data-category-tile={category.name}
      className={`relative overflow-hidden group cursor-pointer ${
        isHomeLayout
          ? `aspect-[3/4] ${category.featured ? 'col-span-2 row-span-1 sm:row-span-2 aspect-auto' : ''}`
          : 'aspect-square'
      }`}
    >
      <SafeImage
        src={category.image}
        alt={category.name}
        className={`w-full h-full object-cover transition-transform ${isHomeLayout ? 'duration-600' : 'duration-700'} group-hover:scale-110`}
      />

      <Link
        to={getShopPathForCategoryTile(category.name)}
        className="absolute inset-0 z-10"
        aria-label={`Shop ${category.name}`}
      />

      <div className={`absolute inset-0 z-[11] pointer-events-none ${isHomeLayout ? 'flex flex-col justify-end p-6' : 'flex flex-col items-center justify-center p-6 text-center'}`}>
        <span className={`text-[10px] tracking-[3px] uppercase text-gold ${isHomeLayout ? 'mb-1.5' : 'mb-2 opacity-0 translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 delay-75'}`}>
          {category.label}
        </span>
        <h3 className={`serif font-light text-white leading-[1.2] ${isHomeLayout ? category.featured ? 'text-4xl' : 'text-2xl' : 'text-3xl sm:text-4xl'}`}>
          {category.name}
        </h3>
      </div>

      <button
        type="button"
        aria-label={`View ${category.name}`}
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 border border-white bg-white/95 px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[2px] text-crimson-dark opacity-0 shadow-sm transition-all duration-300 hover:bg-gold hover:border-gold focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-gold group-hover:opacity-100 group-focus-within:opacity-100"
        onClick={handleViewClick}
      >
        View
      </button>
    </div>
  );
};

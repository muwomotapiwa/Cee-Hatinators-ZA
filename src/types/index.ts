export interface Product {
  id: string;
  name: string;
  variant: string;
  price: number;
  oldPrice?: number;
  currency?: string;
  image: string;
  galleryImages?: string[];
  badge?: string;
  badgeVariant?: 'sale' | 'dark' | 'default' | string;
  colors: string[];
  occasions?: string[];
  collectionSlugs?: string[];
  showOnCollectionsPage?: boolean;
  collectionPageTitle?: string;
  collectionPageDescription?: string;
  collectionPageImage?: string;
  collectionPageImagePosition?: 'left' | 'right';
  category: string;
  description?: string;
  stylingNote?: string;
  sizes?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

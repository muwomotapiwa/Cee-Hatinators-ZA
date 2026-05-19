export interface Product {
  id: string;
  name: string;
  variant: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  badgeVariant?: 'sale' | 'dark' | 'default' | string;
  colors: string[];
  category: string;
  description?: string;
  sizes?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

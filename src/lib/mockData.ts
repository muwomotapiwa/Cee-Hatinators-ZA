import { Product } from '../types';
import { PLACEHOLDER_IMAGES } from './imagePlaceholders';

export const MOCK_CATEGORIES = [
  {
    id: '1',
    name: 'Hatinators',
    label: 'Signature',
    count: '80+ looks',
    image: PLACEHOLDER_IMAGES.headwrap,
    featured: true,
  },
  {
    id: '2',
    name: 'Fascinators',
    label: 'New In',
    count: '45 styles',
    image: PLACEHOLDER_IMAGES.accessories,
  },
  {
    id: '3',
    name: 'Church Hats',
    label: 'Elegant',
    count: '35 pieces',
    image: PLACEHOLDER_IMAGES.clothing,
  },
  {
    id: '4',
    name: 'Accessories',
    label: 'Finishing Touches',
    count: '60+ pieces',
    image: PLACEHOLDER_IMAGES.fabric,
  },
  {
    id: '5',
    name: 'Satin Bonnets',
    label: 'Essential',
    count: '30+ styles',
    image: PLACEHOLDER_IMAGES.bonnet,
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Azure Orchid Hatinator',
    variant: 'Occasion Headwear - Sculpted Bow',
    price: 15.89,
    image: PLACEHOLDER_IMAGES.headwrap,
    badge: 'New',
    colors: ['#4f0254', '#4d0353', '#dcdc44'],
    category: 'Hatinators',
  },
  {
    id: '2',
    name: 'Royal Plum Fascinator',
    variant: 'Fascinators - Feather Accent',
    price: 32.0,
    oldPrice: 40.0,
    image: PLACEHOLDER_IMAGES.accessories,
    badge: 'Limited',
    badgeVariant: 'sale',
    colors: ['#351e49', '#e01386', '#b3899e'],
    category: 'Fascinators',
  },
  {
    id: '3',
    name: 'Luxury Satin Sleep Bonnet',
    variant: 'Satin Bonnets - Soft Lining',
    price: 12.5,
    image: PLACEHOLDER_IMAGES.bonnet,
    colors: ['#4f0254', '#351e49', '#e01386', '#b3899e'],
    category: 'Bonnets',
  },
  {
    id: '4',
    name: 'Cee Signature Church Hat',
    variant: 'Church Hats - Wide Brim',
    price: 89.0,
    image: PLACEHOLDER_IMAGES.clothing,
    badge: 'Exclusive',
    badgeVariant: 'dark',
    colors: ['#4d0353', '#4f0254', '#f9fc04'],
    category: 'Church Hats',
  },
];

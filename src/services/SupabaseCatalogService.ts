import type { Product } from '../types';
import { PLACEHOLDER_IMAGES } from '../lib/imagePlaceholders';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../lib/mockData';
import { supabase } from '../lib/supabase';

export interface CategoryRecord {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  status: 'draft' | 'active' | 'archived';
}

export interface CollectionRecord {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  hero_image_url: string | null;
  featured_product_slug: string | null;
  image_position: 'left' | 'right' | null;
  sort_order: number;
  status: 'draft' | 'active' | 'archived';
}

export interface SpotlightCollectionRecord {
  id: string;
  eyebrow: string | null;
  title: string;
  description: string | null;
  hero_image_url: string | null;
  image_urls: unknown | null;
  details: unknown | null;
  button_label: string | null;
  collection_slug: string | null;
  sort_order: number;
  status: 'draft' | 'active' | 'archived';
}

export interface CategoryTileRecord {
  id: string;
  name: string;
  label: string;
  count: string;
  image: string;
  featured?: boolean;
}

export interface OccasionRecord {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  status: 'draft' | 'active' | 'archived';
}

export interface OccasionOption {
  id: string;
  slug: string;
  name: string;
}

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  base_price_minor: number;
  currency: string;
  compare_at_price_minor: number | null;
  primary_image_url: string | null;
  gallery_image_urls: unknown | null;
  badge: string | null;
  colors: unknown | null;
  styling_note: string | null;
  show_on_collections_page: boolean | null;
  collection_page_title: string | null;
  collection_page_description: string | null;
  collection_page_image_url: string | null;
  collection_page_image_position: 'left' | 'right' | null;
  featured: boolean;
  status: 'draft' | 'active' | 'archived';
};

type ProductCategoryRow = {
  product_id: string;
  category_id: string;
};

type ProductOccasionRow = {
  product_id: string;
  occasion_id: string;
};

type ProductCollectionRow = {
  product_id: string;
  collection_id: string;
};

const DEFAULT_OCCASIONS: OccasionOption[] = [
  { id: 'wedding', slug: 'wedding', name: 'Wedding' },
  { id: 'church', slug: 'church', name: 'Church' },
  { id: 'race-day', slug: 'race-day', name: 'Race Day' },
  { id: 'formal-event', slug: 'formal-event', name: 'Formal Event' },
  { id: 'evening', slug: 'evening', name: 'Evening' },
];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function inferOccasions(row: Pick<ProductRow, 'name' | 'short_description' | 'description'>, categoryName = '') {
  const text = `${row.name} ${row.short_description || ''} ${row.description || ''} ${categoryName}`.toLowerCase();
  const occasions = new Set<string>();

  if (text.includes('wedding')) occasions.add('Wedding');
  if (text.includes('church')) occasions.add('Church');
  if (text.includes('race') || text.includes('wide brim')) occasions.add('Race Day');
  if (text.includes('evening')) occasions.add('Evening');
  if (text.includes('hatinator') || text.includes('fascinator') || text.includes('formal')) occasions.add('Formal Event');

  return Array.from(occasions);
}

function mapProduct(
  row: ProductRow,
  categoryName = 'Accessories',
  occasionNames?: string[],
  collectionSlugs: string[] = [],
  inferMissingOccasions = true
): Product {
  const colors = Array.isArray(row.colors)
    ? row.colors.filter((color): color is string => typeof color === 'string' && color.trim().length > 0)
    : [];
  const galleryImages = Array.isArray(row.gallery_image_urls)
    ? row.gallery_image_urls.filter((url): url is string => typeof url === 'string' && url.trim().length > 0).slice(0, 4)
    : [];

  return {
    id: row.slug || row.id,
    name: row.name,
    variant: row.short_description || categoryName,
    price: row.base_price_minor / 100,
    oldPrice: row.compare_at_price_minor ? row.compare_at_price_minor / 100 : undefined,
    currency: row.currency || 'ZAR',
    image: row.primary_image_url || PLACEHOLDER_IMAGES.product,
    galleryImages,
    badge: row.badge || undefined,
    colors,
    occasions: occasionNames || (inferMissingOccasions ? inferOccasions(row, categoryName) : []),
    collectionSlugs,
    showOnCollectionsPage: Boolean(row.show_on_collections_page),
    collectionPageTitle: row.collection_page_title || undefined,
    collectionPageDescription: row.collection_page_description || undefined,
    collectionPageImage: row.collection_page_image_url || undefined,
    collectionPageImagePosition: row.collection_page_image_position || 'left',
    category: categoryName,
    description: row.description || undefined,
    stylingNote: row.styling_note || undefined,
  };
}

function mapCategory(row: CategoryRecord): CategoryTileRecord {
  return {
    id: row.slug || row.id,
    name: row.name,
    label: row.description || '',
    count: '',
    image: row.image_url || PLACEHOLDER_IMAGES.product,
  };
}

export const SupabaseCatalogService = {
  async getProducts(): Promise<Product[]> {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, slug, name, short_description, description, base_price_minor, currency, compare_at_price_minor, primary_image_url, gallery_image_urls, badge, colors, styling_note, show_on_collections_page, collection_page_title, collection_page_description, collection_page_image_url, collection_page_image_position, featured, status')
      .eq('status', 'active')
      .order('featured', { ascending: false })
      .order('sort_order', { ascending: true });

    if (error || !products || products.length === 0) return MOCK_PRODUCTS;

    const productRows = products as ProductRow[];
    const productIds = productRows.map((product) => product.id);

    const [categoryLinkResult, categoriesResult, collectionLinkResult, collectionsResult, occasionLinkResult, occasionsResult] = await Promise.all([
      supabase.from('product_categories').select('product_id, category_id').in('product_id', productIds),
      supabase.from('categories').select('id, name, slug, description, image_url, sort_order, status').eq('status', 'active'),
      supabase.from('product_collections').select('product_id, collection_id').in('product_id', productIds),
      supabase.from('collections').select('id, slug, name, description, hero_image_url, sort_order, status').eq('status', 'active'),
      supabase.from('product_occasions').select('product_id, occasion_id').in('product_id', productIds),
      supabase.from('occasions').select('id, slug, name, description, sort_order, status').eq('status', 'active'),
    ]);

    const links = categoryLinkResult.data;
    const categories = categoriesResult.data;
    const categoryById = new Map((categories as CategoryRecord[] | null || []).map((category) => [category.id, category]));
    const categoryNameByProductId = new Map<string, string>();

    (links as ProductCategoryRow[] | null || []).forEach((link) => {
      const category = categoryById.get(link.category_id);
      if (category && !categoryNameByProductId.has(link.product_id)) {
        categoryNameByProductId.set(link.product_id, category.name);
      }
    });

    const collectionById = new Map((collectionsResult.data as CollectionRecord[] | null || []).map((collection) => [collection.id, collection]));
    const collectionSlugsByProductId = new Map<string, string[]>();

    (collectionLinkResult.data as ProductCollectionRow[] | null || []).forEach((link) => {
      const collection = collectionById.get(link.collection_id);
      if (!collection) return;

      const current = collectionSlugsByProductId.get(link.product_id) || [];
      collectionSlugsByProductId.set(link.product_id, [...current, collection.slug]);
    });

    const occasionTablesReady = !occasionLinkResult.error && !occasionsResult.error;
    const occasionById = new Map((occasionsResult.data as OccasionRecord[] | null || []).map((occasion) => [occasion.id, occasion]));
    const occasionNamesByProductId = new Map<string, string[]>();

    (occasionLinkResult.data as ProductOccasionRow[] | null || []).forEach((link) => {
      const occasion = occasionById.get(link.occasion_id);
      if (!occasion) return;

      const current = occasionNamesByProductId.get(link.product_id) || [];
      occasionNamesByProductId.set(link.product_id, [...current, occasion.name]);
    });

    return productRows.map((product) => {
      const matchingCategory = (categories as CategoryRecord[] | null || []).find((category) => {
        const productKey = (product.slug || product.name).toLowerCase();
        return category.slug.toLowerCase() === productKey || category.name.toLowerCase() === product.name.toLowerCase();
      });

      return mapProduct(
        product,
        categoryNameByProductId.get(product.id) || matchingCategory?.name,
        occasionTablesReady ? occasionNamesByProductId.get(product.id) || [] : undefined,
        collectionSlugsByProductId.get(product.id) || [],
        !occasionTablesReady
      );
    });
  },

  async getOccasions(): Promise<OccasionOption[]> {
    const { data, error } = await supabase
      .from('occasions')
      .select('id, slug, name, description, sort_order, status')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });

    if (error) return DEFAULT_OCCASIONS;
    if (!data || data.length === 0) return [];

    return (data as OccasionRecord[]).map((occasion) => ({
      id: occasion.id,
      slug: occasion.slug,
      name: occasion.name,
    }));
  },

  async getCategories(): Promise<CategoryTileRecord[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('id, slug, name, description, image_url, sort_order, status')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) return MOCK_CATEGORIES;

    return (data as CategoryRecord[]).map(mapCategory);
  },

  async getCollections(): Promise<CollectionRecord[]> {
    const { data, error } = await supabase
      .from('collections')
      .select('id, slug, name, description, hero_image_url, featured_product_slug, image_position, sort_order, status')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });

    if (error || !data) return [];

    return data as CollectionRecord[];
  },

  async getSpotlightCollection(): Promise<SpotlightCollectionRecord | null> {
    const { data, error } = await supabase
      .from('spotlight_collections')
      .select('id, eyebrow, title, description, hero_image_url, image_urls, details, button_label, collection_slug, sort_order, status')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return data as SpotlightCollectionRecord;
  },

  async seedCurrentSiteData() {
    const categories = [
      { slug: 'hatinators', name: 'Hatinators', description: 'Occasion hatinators and statement headwear.', image_url: PLACEHOLDER_IMAGES.product, sort_order: 1, status: 'active' },
      { slug: 'fascinators', name: 'Fascinators', description: 'Elegant fascinators and feather accents.', image_url: PLACEHOLDER_IMAGES.accessories, sort_order: 2, status: 'active' },
      { slug: 'church-hats', name: 'Church Hats', description: 'Wide brim church hats and formal pieces.', image_url: PLACEHOLDER_IMAGES.product, sort_order: 3, status: 'active' },
      { slug: 'veilings', name: 'Veilings', description: 'Veilings, bonnets, and soft finishing pieces.', image_url: PLACEHOLDER_IMAGES.bonnet, sort_order: 4, status: 'active' },
      { slug: 'accessories', name: 'Accessories', description: 'Finishing accessories for polished looks.', image_url: PLACEHOLDER_IMAGES.accessories, sort_order: 5, status: 'active' },
      ...MOCK_CATEGORIES.map((category, index) => ({
        slug: slugify(category.name),
        name: category.name === 'Bonnet' ? 'Veilings' : category.name,
        description: category.label || null,
        image_url: category.image,
        sort_order: index + 20,
        status: 'active',
      })),
    ];

    const products = MOCK_PRODUCTS.map((product, index) => ({
      slug: slugify(product.name),
      name: product.name,
      short_description: product.variant,
      description: product.description || null,
      base_price_minor: Math.round(product.price * 100),
      compare_at_price_minor: product.oldPrice ? Math.round(product.oldPrice * 100) : null,
      currency: 'ZAR',
      primary_image_url: product.image,
      gallery_image_urls: product.galleryImages || null,
      badge: product.badge || null,
      colors: product.colors,
      styling_note: product.stylingNote || 'Pair purple-led pieces with blush, champagne, ivory, soft metallics, or deep plum for a polished finish.',
      show_on_collections_page: index < 3,
      collection_page_title: product.name,
      collection_page_description: product.description || product.variant,
      collection_page_image_url: product.image,
      collection_page_image_position: index % 2 === 0 ? 'left' : 'right',
      featured: index < 2,
      sort_order: index + 1,
      status: 'active',
    }));

    const collections = [
      {
        slug: 'royal-orchid-edit',
        name: 'Royal Orchid Edit',
        description: 'Regal purple, orchid, and mauve pieces for polished occasion dressing.',
        hero_image_url: PLACEHOLDER_IMAGES.headwrap,
        featured_product_slug: products[0]?.slug || null,
        image_position: 'left',
        sort_order: 1,
        status: 'active',
      },
      {
        slug: 'wedding-guest',
        name: 'Wedding Guest',
        description: 'Lightweight fascinators and hatinators made to complete celebration looks.',
        hero_image_url: PLACEHOLDER_IMAGES.accessories,
        featured_product_slug: products[1]?.slug || null,
        image_position: 'right',
        sort_order: 2,
        status: 'active',
      },
      {
        slug: 'satin-comfort',
        name: 'Satin Comfort',
        description: 'Soft bonnets and refined accessories for care, travel, and evening routines.',
        hero_image_url: PLACEHOLDER_IMAGES.bonnet,
        featured_product_slug: products[2]?.slug || null,
        image_position: 'left',
        sort_order: 3,
        status: 'active',
      },
    ];

    const occasions = DEFAULT_OCCASIONS.map((occasion, index) => ({
      slug: occasion.slug,
      name: occasion.name,
      description: null,
      sort_order: index + 1,
      status: 'active',
    }));

    const contentBlocks = [
      {
        page_key: 'home',
        block_key: 'newsletter',
        title: 'Stay in the Hatinators Circle',
        body: 'New arrivals, colour stories, and occasion styling notes delivered straight to your inbox.',
        sort_order: 1,
        status: 'active',
      },
      {
        page_key: 'home',
        block_key: 'categories_heading',
        title: 'Find Your Perfect Piece',
        subtitle: 'Browse by Category',
        sort_order: 2,
        status: 'active',
      },
      {
        page_key: 'home',
        block_key: 'products_heading',
        title: 'New Headwear',
        subtitle: 'Cee Selection',
        sort_order: 3,
        status: 'active',
      },
      {
        page_key: 'home',
        block_key: 'contact',
        title: "Let's Style the Occasion",
        subtitle: 'Get in Touch',
        body: 'Have a question about a hatinator, fascinator, colour match, or styling for an event? Reach out and the Cee Hatinators team will get back to you within 24 hours.',
        sort_order: 4,
        status: 'active',
      },
      {
        page_key: 'home',
        block_key: 'testimonials_heading',
        title: 'What People Say',
        subtitle: 'Customer Stories',
        sort_order: 5,
        status: 'active',
      },
    ];

    const testimonials = [
      {
        id: '8c61042a-a45e-4aa0-a0e2-7b86c8ec4c11',
        customer_name: 'Amara N.',
        location: 'Johannesburg, South Africa',
        image_url: null,
        rating: 5,
        quote: 'The hatinator framed my whole outfit beautifully. The colour was bold without feeling loud, and the finish felt very special.',
        sort_order: 1,
        status: 'active',
      },
      {
        id: '0ff312ad-93d2-4b4e-860e-15e96dcfeef0',
        customer_name: 'Blessing O.',
        location: 'Lagos, Nigeria',
        image_url: null,
        rating: 5,
        quote: 'I needed a fascinator for a wedding and Cee Hatinators made choosing the right shade so easy. Elegant, polished, and comfortable.',
        sort_order: 2,
        status: 'active',
      },
      {
        id: '585d9eb0-5b48-45ad-a4c7-8db989f51993',
        customer_name: 'Mariame D.',
        location: 'Paris, France',
        image_url: null,
        rating: 5,
        quote: 'The purple edit is stunning. My piece arrived carefully packed and looked even better in person than it did online.',
        sort_order: 3,
        status: 'active',
      },
    ];

    const [categoryResult, productResult, collectionResult, occasionResult, contentResult, testimonialResult] = await Promise.all([
      supabase.from('categories').upsert(categories, { onConflict: 'slug' }),
      supabase.from('products').upsert(products, { onConflict: 'slug' }),
      supabase.from('collections').upsert(collections, { onConflict: 'slug' }),
      supabase.from('occasions').upsert(occasions, { onConflict: 'slug' }),
      supabase.from('site_content_blocks').upsert(contentBlocks, { onConflict: 'page_key,block_key' }),
      supabase.from('testimonials').upsert(testimonials, { onConflict: 'id' }),
    ]);

    const error = categoryResult.error || productResult.error || collectionResult.error || occasionResult.error || contentResult.error || testimonialResult.error;
    if (error) throw error;

    const [{ data: productRows }, { data: categoryRows }, { data: collectionRows }, { data: occasionRows }] = await Promise.all([
      supabase.from('products').select('id, slug').in('slug', products.map((product) => product.slug)),
      supabase.from('categories').select('id, slug').in('slug', categories.map((category) => category.slug)),
      supabase.from('collections').select('id, slug').in('slug', collections.map((collection) => collection.slug)),
      supabase.from('occasions').select('id, slug').in('slug', occasions.map((occasion) => occasion.slug)),
    ]);

    const productIdBySlug = new Map((productRows || []).map((product) => [product.slug, product.id]));
    const categoryIdBySlug = new Map((categoryRows || []).map((category) => [category.slug, category.id]));
    const collectionIdBySlug = new Map((collectionRows || []).map((collection) => [collection.slug, collection.id]));
    const occasionIdBySlug = new Map((occasionRows || []).map((occasion) => [occasion.slug, occasion.id]));
    const categorySlugByProductSlug = new Map(MOCK_PRODUCTS.map((product) => [slugify(product.name), slugify(product.category)]));

    const links = products
      .map((product) => {
        const productId = productIdBySlug.get(product.slug);
        const categoryId = categoryIdBySlug.get(categorySlugByProductSlug.get(product.slug) || '');
        return productId && categoryId ? { product_id: productId, category_id: categoryId } : null;
      })
      .filter(Boolean);

    if (links.length > 0) {
      const { error: linkError } = await supabase.from('product_categories').upsert(links, { onConflict: 'product_id,category_id' });
      if (linkError) throw linkError;
    }

    const spotlightCollectionId = collectionIdBySlug.get('royal-orchid-edit');
    const collectionLinks = spotlightCollectionId
      ? products
          .slice(0, 6)
          .map((product) => {
            const productId = productIdBySlug.get(product.slug);
            return productId ? { product_id: productId, collection_id: spotlightCollectionId } : null;
          })
          .filter(Boolean)
      : [];

    if (collectionLinks.length > 0) {
      const { error: collectionLinkError } = await supabase
        .from('product_collections')
        .upsert(collectionLinks, { onConflict: 'product_id,collection_id' });
      if (collectionLinkError) throw collectionLinkError;
    }

    const occasionLinks = MOCK_PRODUCTS.flatMap((product) => {
      const productSlug = slugify(product.name);
      const productId = productIdBySlug.get(productSlug);
      if (!productId) return [];

      const productRow = products.find((item) => item.slug === productSlug);
      const occasionNames = productRow ? inferOccasions(productRow, product.category) : [];
      return occasionNames
        .map((occasionName) => occasionIdBySlug.get(slugify(occasionName)))
        .filter((occasionId): occasionId is string => Boolean(occasionId))
        .map((occasionId) => ({ product_id: productId, occasion_id: occasionId }));
    });

    if (occasionLinks.length > 0) {
      const { error: occasionLinkError } = await supabase
        .from('product_occasions')
        .upsert(occasionLinks, { onConflict: 'product_id,occasion_id' });
      if (occasionLinkError) throw occasionLinkError;
    }
  },
};

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PLACEHOLDER_IMAGES } from '../lib/imagePlaceholders';
import { SafeImage } from '../components/SafeImage';
import { CollectionRecord, SupabaseCatalogService } from '../services/SupabaseCatalogService';
import { ProductService } from '../services/ProductService';
import { Product } from '../types';

export function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      SupabaseCatalogService.getCollections(),
      ProductService.getProducts(),
    ]).then(([collectionData, productData]) => {
      setCollections(collectionData);
      setProducts(productData);
      setLoading(false);
    });
  }, []);

  const getCollectionProduct = (collection: CollectionRecord) => {
    if (collection.featured_product_slug) {
      const featuredProduct = products.find((product) => product.id === collection.featured_product_slug);
      if (featuredProduct) return featuredProduct;
    }

    return products.find((product) => (product.collectionSlugs || []).includes(collection.slug));
  };

  const visibleCollections = collections
    .map((collection) => ({
      collection,
      product: getCollectionProduct(collection),
    }))
    .filter((item) => Boolean(item.product));

  const productCollections = products
    .filter((product) => product.showOnCollectionsPage)
    .map((product, index) => ({
      id: product.id,
      title: product.collectionPageTitle || product.name,
      description: product.collectionPageDescription || product.description || product.variant,
      image: product.collectionPageImage || product.image || PLACEHOLDER_IMAGES.product,
      imagePosition: product.collectionPageImagePosition || (index % 2 === 0 ? 'left' : 'right'),
      product,
    }));

  const rows = productCollections.length > 0
    ? productCollections
    : visibleCollections
      .map(({ collection, product }) => {
        if (!product) return null;

        return {
          id: collection.id,
          title: collection.name,
          description: collection.description || product.description || product.variant,
          image: collection.hero_image_url || product.image || PLACEHOLDER_IMAGES.product,
          imagePosition: collection.image_position || 'left',
          product,
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

  return (
    <div className="bg-offwhite min-h-screen py-16 sm:py-24">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        <div className="text-center mb-16">
          <span className="text-[10px] sm:text-[11px] tracking-[3px] uppercase text-crimson mb-3 block">Curated Series</span>
          <h1 className="serif text-[clamp(36px,5vw,64px)] font-light text-dark leading-[1.1]">
            Cee <em className="italic text-crimson">Collections</em>
          </h1>
          <div className="w-12 h-px bg-crimson mx-auto mt-6"></div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[10px] tracking-[2px] uppercase text-mid-gray">
            Loading collections...
          </div>
        ) : rows.length === 0 ? (
          <div className="py-20 text-center text-[13px] text-charcoal">
            No collections are ready yet.
          </div>
        ) : (
          <div className="flex flex-col gap-12 sm:gap-20">
            {rows.map((row) => {
              const imageOnRight = row.imagePosition === 'right';

              return (
                <Link
                  to={`/product/${row.product.id}`}
                  key={row.id}
                  className={`flex flex-col ${imageOnRight ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16 items-center group`}
                >
                  <div className="w-full md:w-1/2 aspect-[4/3] overflow-hidden">
                    <SafeImage
                      src={row.image}
                      alt={row.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left px-4 md:px-0">
                    <h2 className="serif text-3xl sm:text-5xl font-light text-dark mb-4 group-hover:text-crimson transition-colors">
                      {row.title}
                    </h2>
                    <p className="text-[13px] text-charcoal font-light leading-relaxed mb-4 max-w-md mx-auto md:mx-0">
                      {row.description}
                    </p>
                    <p className="text-[10px] tracking-[2px] uppercase text-mid-gray mb-8">
                      Featured piece: {row.product.name}
                    </p>
                    <div>
                      <span className="inline-block border-b border-crimson text-[11px] tracking-[2px] uppercase text-crimson pb-1 transition-all group-hover:pr-4">
                        Explore Collection -&gt;
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

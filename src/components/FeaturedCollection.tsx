import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PLACEHOLDER_IMAGES } from '../lib/imagePlaceholders';
import { SafeImage } from './SafeImage';
import { SpotlightCollectionRecord, SupabaseCatalogService } from '../services/SupabaseCatalogService';

function getStringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

export function FeaturedCollection() {
  const [spotlight, setSpotlight] = useState<SpotlightCollectionRecord | null>(null);
  const extraImages = getStringList(spotlight?.image_urls).slice(0, 2);
  const images = [
    spotlight?.hero_image_url || PLACEHOLDER_IMAGES.headwrap,
    extraImages[0] || PLACEHOLDER_IMAGES.accessories,
    extraImages[1] || PLACEHOLDER_IMAGES.clothing,
  ];
  const details = getStringList(spotlight?.details);

  useEffect(() => {
    SupabaseCatalogService.getSpotlightCollection().then(setSpotlight);
  }, []);

  if (!spotlight) return null;

  return (
    <section id="collections" className="py-16 sm:py-24">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="grid grid-cols-2 grid-rows-[auto_auto] gap-2 sm:gap-3">
            <div className="col-span-2 h-[200px] sm:h-[300px] overflow-hidden group">
              <SafeImage
                src={images[0]}
                alt={`${spotlight.title} hero`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <div className="h-[200px] overflow-hidden group">
              <SafeImage
                src={images[1]}
                alt={`${spotlight.title} detail one`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <div className="h-[200px] overflow-hidden group">
              <SafeImage
                src={images[2]}
                alt={`${spotlight.title} detail two`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
          </div>

          <div className="pl-5">
            <span className="text-[10px] tracking-[3px] uppercase text-crimson mb-5 block">
              {spotlight.eyebrow || 'Spotlight Collection'}
            </span>
            <h2 className="serif text-[clamp(36px,4vw,56px)] font-light leading-[1.1] text-dark mb-6">
              {spotlight.title}
            </h2>
            {spotlight.description && (
              <p className="text-[13px] leading-[2] text-charcoal tracking-[0.5px] mb-9 font-light">
                {spotlight.description}
              </p>
            )}

            {details.length > 0 && (
              <div className="mb-9 space-y-0">
                {details.map((detail, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 border-b border-silver text-[12px] tracking-[1px] text-charcoal">
                    <span className="w-1.5 h-1.5 bg-crimson shrink-0"></span>
                    {detail}
                  </div>
                ))}
              </div>
            )}

            {spotlight.collection_slug && (
              <Link
                to={`/shop?collection=${spotlight.collection_slug}`}
                className="px-9 py-4 font-sans text-[11px] tracking-[2.5px] uppercase cursor-pointer font-semibold transition-all duration-250 inline-block no-underline bg-crimson text-white hover:bg-crimson-mid"
              >
                {spotlight.button_label || 'Shop the Collection'}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import { Button } from './Button';
import { useProductModal } from '../context/ProductModalContext';
import { MOCK_PRODUCTS } from '../lib/mockData';
import { PLACEHOLDER_IMAGES } from '../lib/imagePlaceholders';
import { SafeImage } from './SafeImage';

export function FeaturedCollection() {
  const { openProductModal } = useProductModal();
  const featuredProduct = MOCK_PRODUCTS.find(p => p.id === '2');

  const handleImageClick = () => {
    if (featuredProduct) openProductModal(featuredProduct);
  };

  return (
    <section id="collections" className="py-16 sm:py-24">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="grid grid-cols-2 grid-rows-[auto_auto] gap-2 sm:gap-3">
            <div className="col-span-2 h-[200px] sm:h-[300px] overflow-hidden group cursor-pointer" onClick={handleImageClick}>
              <SafeImage
                src={PLACEHOLDER_IMAGES.headwrap}
                alt="Cee Hatinators signature headwear"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <div className="h-[200px] overflow-hidden group cursor-pointer" onClick={handleImageClick}>
              <SafeImage
                src={PLACEHOLDER_IMAGES.accessories}
                alt="Royal plum fascinator"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <div className="h-[200px] overflow-hidden group cursor-pointer" onClick={handleImageClick}>
              <SafeImage
                src={PLACEHOLDER_IMAGES.clothing}
                alt="Occasion church hat"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
          </div>

          <div className="pl-5">
            <span className="text-[10px] tracking-[3px] uppercase text-crimson mb-5 block">Spotlight Collection</span>
            <h2 className="serif text-[clamp(36px,4vw,56px)] font-light leading-[1.1] text-dark mb-6">
              The Royal <em className="italic text-crimson">Orchid</em> Edit
            </h2>
            <p className="text-[13px] leading-[2] text-charcoal tracking-[0.5px] mb-9 font-light">
              A polished occasion edit led by rich purple, orchid, mauve, and graceful accents. Each piece is chosen to frame the face beautifully and finish an outfit with quiet confidence.
            </p>

            <div className="mb-9 space-y-0">
              {[
                'Elegant silhouettes for weddings and celebrations',
                'Statement colour stories in purple, orchid, and mauve',
                'Lightweight pieces designed for comfortable wear',
                'Coordinated accessories for a finished look',
                'Styling support for special occasions'
              ].map((detail, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-silver text-[12px] tracking-[1px] text-charcoal">
                  <span className="w-1.5 h-1.5 bg-crimson shrink-0"></span>
                  {detail}
                </div>
              ))}
            </div>

            <Button variant="primary">Shop the Collection</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

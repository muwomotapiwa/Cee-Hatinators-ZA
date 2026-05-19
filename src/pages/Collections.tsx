import { Link } from 'react-router-dom';
import { PLACEHOLDER_IMAGES } from '../lib/imagePlaceholders';
import { SafeImage } from '../components/SafeImage';

export function CollectionsPage() {
  const collections = [
    {
      id: 'royal-orchid-edit',
      name: 'Royal Orchid Edit',
      desc: 'Regal purple, orchid, and mauve pieces for polished occasion dressing.',
      image: PLACEHOLDER_IMAGES.headwrap,
    },
    {
      id: 'wedding-guest',
      name: 'Wedding Guest',
      desc: 'Lightweight fascinators and hatinators made to complete celebration looks.',
      image: PLACEHOLDER_IMAGES.accessories,
    },
    {
      id: 'satin-comfort',
      name: 'Satin Comfort',
      desc: 'Soft bonnets and refined accessories for care, travel, and evening routines.',
      image: PLACEHOLDER_IMAGES.bonnet,
    }
  ];

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

        <div className="flex flex-col gap-12 sm:gap-20">
          {collections.map((col, idx) => (
            <Link
              to={`/shop?collection=${col.id}`}
              key={col.id}
              className={`flex flex-col ${idx % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16 items-center group`}
            >
              <div className="w-full md:w-1/2 aspect-[4/3] overflow-hidden">
                  <SafeImage
                    src={col.image}
                    alt={col.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left px-4 md:px-0">
                <h2 className="serif text-3xl sm:text-5xl font-light text-dark mb-4 group-hover:text-crimson transition-colors">
                  {col.name}
                </h2>
                <p className="text-[13px] text-charcoal font-light leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                  {col.desc}
                </p>
                <div>
                  <span className="inline-block border-b border-crimson text-[11px] tracking-[2px] uppercase text-crimson pb-1 transition-all group-hover:pr-4">
                    Explore Collection -&gt;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

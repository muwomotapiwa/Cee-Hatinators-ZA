import { ArrowRight, Crown, HeartHandshake, Scissors, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SafeImage } from '../components/SafeImage';
import { PLACEHOLDER_IMAGES } from '../lib/imagePlaceholders';

const storyValues = [
  {
    title: 'Occasion First',
    copy: 'Every headpiece is chosen around the outfit, the room, and the entrance it needs to complete.',
    icon: Crown,
  },
  {
    title: 'Styled With Care',
    copy: 'We love refined drama: sculptural lines, soft finishes, and pieces that feel polished from every angle.',
    icon: Scissors,
  },
  {
    title: 'Colour Confident',
    copy: 'Royal purple, orchid, mauve, gold, and bold accents shape a collection made to be remembered.',
    icon: Sparkles,
  },
];

const processSteps = [
  {
    step: '01',
    title: 'Listen To The Look',
    copy: 'A wedding, church service, graduation, or celebration all ask for a different kind of presence.',
  },
  {
    step: '02',
    title: 'Match The Moment',
    copy: 'Shape, colour, texture, and height come together so the piece supports the full outfit.',
  },
  {
    step: '03',
    title: 'Finish With Confidence',
    copy: 'The final test is simple: it should feel elegant, secure, comfortable, and unmistakably you.',
  },
];

export function OurStoryPage() {
  return (
    <div className="bg-offwhite text-dark">
      <section className="relative min-h-[76vh] overflow-hidden bg-crimson-dark">
        <Link to="/shop?category=Hatinators" aria-label="Shop Cee Hatinators headwear" className="absolute inset-0">
          <SafeImage
            src={PLACEHOLDER_IMAGES.headwrap}
            alt="Elegant occasion headwear in Cee Hatinators colours"
            className="h-full w-full object-cover"
            loading="eager"
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(53,30,73,0.96)_0%,rgba(79,2,84,0.74)_45%,rgba(224,19,134,0.35)_100%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, var(--color-gold) 0, var(--color-gold) 1px, transparent 0, transparent 44px)',
          }}
        />

        <div className="relative z-10 mx-auto flex min-h-[76vh] max-w-[1400px] flex-col justify-end px-6 pb-16 pt-24 sm:px-10 md:px-20 md:pb-20">
          <span className="mb-4 text-[10px] uppercase tracking-[4px] text-gold">Our Story</span>
          <h1 className="serif max-w-3xl text-[clamp(44px,7vw,92px)] font-light leading-[0.98] text-offwhite">
            Made for the moment you walk in.
          </h1>
          <p className="mt-6 max-w-xl text-[13px] font-light leading-[1.9] tracking-[0.7px] text-silver sm:text-sm">
            Cee Hatinators celebrates occasion headwear with poise, colour, and presence. The aim is simple:
            help every customer feel beautifully finished before the first hello.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 bg-crimson px-8 py-4 text-[11px] font-semibold uppercase tracking-[2.5px] text-white transition-colors hover:bg-crimson-mid"
            >
              Shop Headwear
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/collections"
              className="inline-flex items-center justify-center border border-white/40 px-8 py-4 text-[11px] font-semibold uppercase tracking-[2.5px] text-offwhite transition-colors hover:border-gold hover:text-gold"
            >
              View Collections
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] grid-cols-1 border-b border-mauve/30 px-6 py-10 sm:grid-cols-3 sm:px-10 md:px-20">
        {['Hatinators', 'Fascinators', 'Occasion Styling'].map((item) => (
          <div key={item} className="border-mauve/30 py-5 sm:border-l sm:px-8 first:sm:border-l-0">
            <span className="block text-[10px] uppercase tracking-[3px] text-crimson">Cee Signature</span>
            <span className="serif mt-2 block text-2xl font-light text-dark">{item}</span>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 py-16 sm:px-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-20 md:py-24">
        <div>
          <span className="text-[10px] uppercase tracking-[3px] text-crimson">Why We Exist</span>
          <h2 className="serif mt-4 text-[clamp(34px,4vw,58px)] font-light leading-tight text-dark">
            Headwear should feel like the finishing note, not an afterthought.
          </h2>
        </div>
        <div className="grid gap-5">
          {storyValues.map(({ title, copy, icon: Icon }) => (
            <article key={title} className="grid grid-cols-[44px_1fr] gap-5 border-t border-mauve/30 pt-5">
              <span className="flex h-11 w-11 items-center justify-center border border-crimson/30 text-crimson">
                <Icon size={18} />
              </span>
              <div>
                <h3 className="text-[12px] uppercase tracking-[2px] text-dark">{title}</h3>
                <p className="mt-2 text-[13px] leading-[1.8] text-charcoal">{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-stretch gap-0 px-6 py-16 sm:px-10 md:grid-cols-2 md:px-20 md:py-24">
          <Link to="/collections" aria-label="View Cee Hatinators collections" className="relative block min-h-[380px] overflow-hidden group">
            <SafeImage
              src={PLACEHOLDER_IMAGES.accessories}
              alt="Detailed fascinator styling"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-crimson-dark/88 p-6 text-offwhite sm:p-8">
              <span className="text-[10px] uppercase tracking-[3px] text-gold">The Feeling</span>
              <p className="serif mt-3 text-2xl font-light leading-snug text-offwhite sm:text-3xl">
                Elegant enough for the aisle. Bold enough for the camera. Comfortable enough for the whole day.
              </p>
            </div>
          </Link>

          <div className="bg-offwhite px-0 py-10 md:px-12 md:py-12">
            <span className="text-[10px] uppercase tracking-[3px] text-crimson">From Fit To Finish</span>
            <div className="mt-8 grid gap-8">
              {processSteps.map((item) => (
                <div key={item.step} className="grid grid-cols-[54px_1fr] gap-5">
                  <span className="serif text-4xl font-light text-mauve">{item.step}</span>
                  <div>
                    <h3 className="text-[12px] uppercase tracking-[2px] text-dark">{item.title}</h3>
                    <p className="mt-2 text-[13px] leading-[1.8] text-charcoal">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex items-center gap-3 border-t border-mauve/30 pt-7 text-[12px] leading-[1.8] text-charcoal">
              <HeartHandshake className="shrink-0 text-crimson" size={22} />
              <span>Made for customers who want polish, personality, and a memorable entrance.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-crimson-dark px-6 py-14 text-center text-offwhite sm:px-10 md:py-18">
        <span className="text-[10px] uppercase tracking-[3px] text-gold">Ready For Your Moment?</span>
        <h2 className="serif mx-auto mt-4 max-w-3xl text-[clamp(32px,4vw,54px)] font-light leading-tight">
          Find the piece that makes the outfit feel complete.
        </h2>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center justify-center gap-2 bg-gold px-8 py-4 text-[11px] font-semibold uppercase tracking-[2.5px] text-crimson-dark transition-colors hover:bg-gold-light"
        >
          Explore Collection
          <ArrowRight size={15} />
        </Link>
      </section>
    </div>
  );
}

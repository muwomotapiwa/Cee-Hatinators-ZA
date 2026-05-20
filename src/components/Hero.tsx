import { useNavigate } from 'react-router-dom';
import { Button } from './Button';

export function Hero() {
  const navigate = useNavigate();

  const scrollToCategories = () => {
    document.getElementById('categories')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <section className="relative h-[92vh] max-h-[820px] overflow-hidden bg-crimson-dark">
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(79,2,84,0.94) 0%, rgba(53,30,73,0.84) 48%, rgba(224,19,134,0.48) 100%), url('https://images.unsplash.com/photo-1614093302611-8efc4c4f0b35?w=1600&q=80')`
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, var(--color-gold) 0, var(--color-gold) 1px, transparent 0, transparent 50%)`,
          backgroundSize: '20px 20px'
        }}
      />

      <div className="relative h-full max-w-[1400px] mx-auto px-6 sm:px-10 md:px-20 flex flex-col justify-center gap-4 sm:gap-6">
        <span className="text-[9px] sm:text-[11px] tracking-[3px] sm:tracking-[4px] uppercase text-gold font-normal">Occasion Headwear / 2026</span>
        <h1 className="serif font-light text-[clamp(40px,8vw,96px)] text-offwhite leading-[1.1] sm:leading-none max-w-[600px]">
          Cee <em className="italic text-gold-light">Hatinators</em>
        </h1>
        <p className="text-[11px] sm:text-[13px] tracking-[1px] sm:tracking-[1.5px] text-silver max-w-[400px] leading-[1.6] sm:leading-[1.9] font-light">
          Elegant hatinators, fascinators, and statement headpieces in royal purple, orchid, mauve, and confident colour.
        </p>
        <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 items-stretch xs:items-center mt-2">
          <Button variant="primary" onClick={scrollToCategories}>Explore Collection</Button>
          <Button variant="ghost" onClick={() => navigate('/our-story')}>Our Story</Button>
        </div>
      </div>

      <div className="absolute bottom-10 sm:bottom-12 right-6 sm:right-10 md:right-20 flex gap-6 sm:gap-12 opacity-0 sm:opacity-100 pointer-events-none sm:pointer-events-auto">
        <div className="text-right">
          <span className="serif block text-3xl sm:text-4xl font-light text-offwhite">Made</span>
          <span className="text-[8px] sm:text-[10px] tracking-[1px] sm:tracking-[2px] text-mid-gray uppercase">To Style</span>
        </div>
        <div className="text-right">
          <span className="serif block text-3xl sm:text-4xl font-light text-offwhite">200+</span>
          <span className="text-[8px] sm:text-[10px] tracking-[1px] sm:tracking-[2px] text-mid-gray uppercase">Looks</span>
        </div>
      </div>

      <div className="absolute bottom-[40px] sm:bottom-[52px] left-6 sm:left-10 md:left-20 flex items-center gap-3 text-[9px] sm:text-[10px] tracking-[2px] text-mid-gray uppercase">
        <span className="w-8 sm:w-12 h-px bg-mid-gray animate-pulse-width"></span>
        Scroll
      </div>

      <style>{`
        @keyframes pulseWidth {
          0%, 100% { opacity: 0.3; width: 24px; }
          50% { opacity: 1; width: 48px; }
        }
        .animate-pulse-width {
          animation: pulseWidth 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

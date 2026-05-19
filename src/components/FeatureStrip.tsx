import { Gem, Globe2, RotateCcw, Star } from 'lucide-react';

export function FeatureStrip() {
  const features = [
    { icon: Globe2, name: 'Worldwide Shipping', desc: 'Elegant headwear delivered for occasions near and far.' },
    { icon: Gem, name: 'Polished Finish', desc: 'Colour, silhouette, and trim details are selected for a refined look.' },
    { icon: RotateCcw, name: 'Easy Returns', desc: 'A clear returns flow keeps shopping calm and straightforward.' },
    { icon: Star, name: 'Occasion Ready', desc: 'Pieces chosen for weddings, church, celebrations, and formal events.' },
  ];

  return (
    <div className="bg-crimson-dark py-10 sm:py-14">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
        {features.map((f, i) => {
          const Icon = f.icon;

          return (
            <div key={i} className="bg-crimson-dark p-6 sm:p-8 text-center border-b border-white/5 lg:border-none last:border-b-0">
              <div className="w-12 h-12 border border-gold/30 flex items-center justify-center mx-auto mb-4 text-gold">
                <Icon size={20} strokeWidth={1.5} />
              </div>
              <div className="text-[12px] tracking-[2px] uppercase text-offwhite mb-2 font-medium">
                {f.name}
              </div>
              <div className="text-[12px] text-mid-gray leading-[1.7] tracking-[0.5px]">
                {f.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

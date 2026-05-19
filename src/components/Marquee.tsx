export function Marquee() {
  const items = [
    'Statement Hatinators', 'Wedding Fascinators', 'Church Hats', 'Purple Edit',
    'Royal Purple Details', 'Satin Bonnets', 'Occasion Styling', 'Worldwide Shipping'
  ];

  return (
    <div className="bg-crimson py-3.5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center">
            <span className="text-[10px] tracking-[3px] uppercase text-gold-light px-8 font-light">{item}</span>
            <span className="text-gold/40 text-base leading-none px-2">/</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 28s linear infinite;
        }
      `}</style>
    </div>
  );
}

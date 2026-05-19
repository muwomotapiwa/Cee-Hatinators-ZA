export function Testimonials() {
  const testimonials = [
    {
      text: 'The hatinator framed my whole outfit beautifully. The colour was bold without feeling loud, and the finish felt very special.',
      author: 'Amara N.',
      location: 'London, United Kingdom'
    },
    {
      text: 'I needed a fascinator for a wedding and Cee Hatinators made choosing the right shade so easy. Elegant, polished, and comfortable.',
      author: 'Blessing O.',
      location: 'Lagos, Nigeria'
    },
    {
      text: 'The purple edit is stunning. My piece arrived carefully packed and looked even better in person than it did online.',
      author: 'Mariame D.',
      location: 'Paris, France'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#f4eef5]">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        <div className="text-center mb-10 sm:mb-12">
          <span className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] uppercase text-crimson mb-2 sm:mb-3 block">Customer Stories</span>
          <h2 className="serif text-[clamp(28px,4vw,52px)] font-light text-dark leading-[1.1]">
            What People <em className="italic text-crimson">Say</em>
          </h2>
          <div className="w-10 sm:w-12 h-px bg-crimson mx-auto mt-4 sm:mt-5"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-7 sm:p-9 relative border border-mauve/35">
              <span className="serif text-[64px] text-crimson leading-[0.5] mb-5 block opacity-30">&quot;</span>
              <p className="serif text-[18px] italic leading-[1.7] text-dark mb-6">{t.text}</p>
              <div className="text-gold text-[12px] tracking-[3px] mb-3">5-star</div>
              <div className="text-[11px] tracking-[2px] uppercase text-mid-gray">{t.author}</div>
              <div className="text-[10px] text-silver mt-1 tracking-[1px]">{t.location}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

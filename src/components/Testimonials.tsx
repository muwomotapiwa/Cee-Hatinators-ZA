import { useEffect, useState } from 'react';
import { useContentBlock } from '../hooks/useContentBlock';
import { supabase } from '../lib/supabase';

interface TestimonialRecord {
  id: string;
  customer_name: string;
  location: string | null;
  image_url: string | null;
  rating: number | null;
  quote: string;
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>([]);
  const heading = useContentBlock('home', 'testimonials_heading', {
    title: 'What People Say',
    subtitle: 'Customer Stories',
    body: '',
    media_url: null,
    button_label: null,
    button_url: null,
  });

  useEffect(() => {
    let active = true;

    supabase
      .from('testimonials')
      .select('id, customer_name, location, image_url, rating, quote')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .limit(6)
      .then(({ data, error }) => {
        if (!active || error) return;
        setTestimonials((data || []) as TestimonialRecord[]);
      });

    return () => {
      active = false;
    };
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-16 sm:py-20 bg-[#f4eef5]">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        <div className="text-center mb-10 sm:mb-12">
          <span className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] uppercase text-crimson mb-2 sm:mb-3 block">
            {heading.subtitle}
          </span>
          <h2 className="serif text-[clamp(28px,4vw,52px)] font-light text-dark leading-[1.1]">
            {heading.title}
          </h2>
          <div className="w-10 sm:w-12 h-px bg-crimson mx-auto mt-4 sm:mt-5"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mt-4">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-7 sm:p-9 relative border border-mauve/35 w-full md:w-[calc((100%-48px)/3)] md:max-w-[380px]">
              {testimonial.image_url && (
                <img
                  src={testimonial.image_url}
                  alt={testimonial.customer_name}
                  className="h-16 w-16 rounded-full object-cover border border-mauve/40 mb-5"
                />
              )}
              <span className="serif text-[64px] text-crimson leading-[0.5] mb-5 block opacity-30">&quot;</span>
              <p className="serif text-[18px] italic leading-[1.7] text-dark mb-6">{testimonial.quote}</p>
              {testimonial.rating && (
                <div className="text-gold text-[12px] tracking-[3px] mb-3">{testimonial.rating}-star</div>
              )}
              <div className="text-[11px] tracking-[2px] uppercase text-mid-gray">{testimonial.customer_name}</div>
              {testimonial.location && (
                <div className="text-[10px] text-silver mt-1 tracking-[1px]">{testimonial.location}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

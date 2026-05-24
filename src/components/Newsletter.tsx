import type { FormEvent } from 'react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useContentBlock } from '../hooks/useContentBlock';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const content = useContentBlock('home', 'newsletter', {
    title: 'Stay in the Hatinators Circle',
    subtitle: '',
    body: 'New arrivals, colour stories, and occasion styling notes delivered straight to your inbox.',
    media_url: null,
    button_label: null,
    button_url: null,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, source: 'website_footer' });

    if (error) {
      setMessage(error.code === '23505' ? 'You are already subscribed.' : error.message);
      return;
    }

    setEmail('');
    setMessage('Thank you for subscribing.');
  };

  return (
    <section className="bg-crimson py-20 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="max-w-[600px] mx-auto px-10 text-center relative">
        <h2 className="serif text-[clamp(36px,5vw,52px)] font-light text-white mb-4 leading-[1.1]">
          {content.title}
        </h2>
        <p className="text-[12px] tracking-[1.5px] text-white/70 leading-[1.8] mb-9 font-light">
          {content.body}
        </p>
        <form className="flex max-w-[440px] mx-auto" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Your email address"
            className="flex-1 p-4 border border-white/30 bg-white/10 text-white font-sans text-xs tracking-wide outline-none focus:border-gold placeholder:text-white/40"
            required
          />
          <button className="px-6 py-4 bg-gold text-crimson-dark font-sans text-[10px] tracking-[2px] uppercase cursor-pointer font-semibold transition-colors duration-200 hover:bg-gold-light">
            Subscribe
          </button>
        </form>
        {message && <p className="mt-4 text-[11px] tracking-[1px] text-white/75">{message}</p>}
      </div>
    </section>
  );
}

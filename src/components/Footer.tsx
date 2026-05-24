import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';

export function Footer() {
  const { settings } = useSiteSettings();
  const socialLinks = [
    { label: 'IG', url: settings.social_links.instagram },
    { label: 'FB', url: settings.social_links.facebook },
    { label: 'YT', url: settings.social_links.youtube },
    { label: 'PT', url: settings.social_links.pinterest },
  ];
  const shippingRates = settings.shipping_summary.rates?.length
    ? settings.shipping_summary.rates
    : ['South Africa only', 'Standard delivery: ZAR 99.00', 'Free delivery over ZAR 1,500.00'];

  return (
    <footer className="bg-crimson-dark text-mid-gray pt-12 sm:pt-18 pb-10">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 sm:gap-15">
        <div className="footer-brand max-w-sm">
          <Link to="/" aria-label="Cee Hatinators home" className="inline-flex no-underline mb-6">
            <span className="inline-flex items-center gap-3">
              <span className="serif flex h-11 w-11 items-center justify-center border border-gold/70 text-[19px] font-light italic leading-none text-gold-light">
                C
              </span>
              <span className="flex flex-col leading-none">
                <span className="serif text-[24px] font-light text-offwhite">
                  Cee
                </span>
                <span className="text-[9px] uppercase tracking-[2.8px] text-mauve">
                  Hatinators
                </span>
              </span>
            </span>
          </Link>
          <p className="serif text-sm sm:text-base italic text-silver leading-[1.7] mb-7 font-light">
            {settings.footer_statement}
          </p>
          <div className="flex gap-3">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.url || '#'} className="w-8 h-8 sm:w-9 sm:h-9 border border-white/10 flex items-center justify-center text-mid-gray text-xs sm:text-sm no-underline transition-all duration-200 hover:border-gold hover:text-gold">
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] tracking-[2px] sm:tracking-[3px] uppercase text-offwhite mb-5 sm:mb-6 font-medium border-b border-white/5 pb-2 sm:border-0 sm:pb-0">Information</h4>
          <ul className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-3">
            {[
              { name: 'Our Story', path: '/our-story' },
              { name: 'Reviews', path: '/#testimonials' },
              { name: 'Shipping', path: '/shipping-returns' },
              { name: 'Returns', path: '/shipping-returns' },
              { name: 'Style Guide', path: '/faq' },
              { name: 'Occasions', path: '/collections' },
              { name: 'Contact', path: '/contact' }
            ].map((item) => (
              <li key={item.name}>
                <Link to={item.path} className="text-[11px] sm:text-[12px] tracking-[0.5px] text-charcoal no-underline transition-colors duration-200 hover:text-gold">{item.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] tracking-[2px] sm:tracking-[3px] uppercase text-offwhite mb-5 sm:mb-6 font-medium border-b border-white/5 pb-2 sm:border-0 sm:pb-0">Products</h4>
          <ul className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-3">
            {[
              { name: 'Hatinators', path: '/shop?category=Hatinators' },
              { name: 'Fascinators', path: '/shop?category=Fascinators' },
              { name: 'Church Hats', path: '/shop?category=Church Hats' },
              { name: 'Veilings', path: '/shop?category=Veilings' },
              { name: 'Accessories', path: '/shop?category=Accessories' },
              { name: 'Purple Edit', path: '/shop?category=Hatinators' },
              { name: 'Orchid Purple', path: '/shop?category=Fascinators' }
            ].map((item) => (
              <li key={item.name}>
                <Link to={item.path} className="text-[11px] sm:text-[12px] tracking-[0.5px] text-charcoal no-underline transition-colors duration-200 hover:text-gold">{item.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] tracking-[2px] sm:tracking-[3px] uppercase text-offwhite mb-5 sm:mb-6 font-medium border-b border-white/5 pb-2 sm:border-0 sm:pb-0">Shipping Rates</h4>
          <ul className="space-y-3">
            {shippingRates.map((item) => (
              <li key={item} className="text-[11px] sm:text-[12px] tracking-[0.5px] text-charcoal">{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-12 sm:mt-14 pt-8 pb-4 flex flex-col sm:flex-row justify-between items-center border-t border-white/5 gap-6 sm:gap-0">
        <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
          <span className="text-[10px] sm:text-[11px] text-charcoal tracking-[0.5px]">Copyright 2026 Cee Hatinators. All rights reserved.</span>
          <a
            href="https://www.kypextech.co.za"
            target="_blank"
            rel="noreferrer"
            className="footer-credit-glow text-[9px] sm:text-[10px] uppercase tracking-[1.4px] text-mauve no-underline"
          >
            Site managed by Kypextech Solutions
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-2 items-center">
          {['Visa', 'MC', 'Amex', 'PayPal', 'Apple Pay'].map((p) => (
            <span key={p} className="px-1.5 py-0.5 border border-white/10 text-[9px] sm:text-[10px] tracking-[1px] text-charcoal uppercase">{p}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}

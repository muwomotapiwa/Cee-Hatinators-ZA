import { Hero } from '../components/Hero';
import { Marquee } from '../components/Marquee';
import { CategoryGrid } from '../components/CategoryGrid';
import { ProductGrid } from '../components/ProductGrid';
import { FeatureStrip } from '../components/FeatureStrip';
import { FeaturedCollection } from '../components/FeaturedCollection';
import { ContactForm } from '../components/ContactForm';
import { Testimonials } from '../components/Testimonials';
import { Newsletter } from '../components/Newsletter';

export function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <CategoryGrid />
      <ProductGrid />
      <FeatureStrip />
      <FeaturedCollection />
      <ContactForm />
      <Testimonials />
      <Newsletter />
    </>
  );
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './Button';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    console.log('Form data:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Thank you for your message. We will get back to you soon.');
    reset();
  };

  return (
    <section className="py-16 sm:py-20 bg-white" id="contact">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <div>
          <span className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] uppercase text-crimson mb-4 sm:mb-5 block">Get in Touch</span>
          <h2 className="serif text-[clamp(32px,4vw,56px)] font-light text-dark leading-[1.1] mb-5 sm:mb-6">
            Let&apos;s Style the <em className="italic text-crimson">Occasion</em>
          </h2>
          <p className="text-[12px] sm:text-[13px] leading-[1.8] sm:leading-[2] text-charcoal tracking-[0.5px] mb-8 sm:mb-9 font-light max-w-[440px]">
            Have a question about a hatinator, fascinator, colour match, or styling for an event? Reach out and the Cee Hatinators team will get back to you within 24 hours.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 sm:gap-8">
            <div>
              <h4 className="text-[10px] tracking-[2px] uppercase text-dark font-semibold mb-2">Visit Our Studio</h4>
              <p className="text-[12px] sm:text-[13px] text-charcoal font-light">123 Occasion Lane, Design District<br />London, E1 6AN</p>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[2px] uppercase text-dark font-semibold mb-2">Contact Details</h4>
              <p className="text-[12px] sm:text-[13px] text-charcoal font-light">hello@ceehatinators.com<br />+44 (0) 20 7123 4567</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-1">
              <label className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium">Your Name</label>
              <input
                {...register('name')}
                className={`w-full p-4 border ${errors.name ? 'border-red-500' : 'border-silver'} bg-offwhite font-sans text-xs outline-none focus:border-crimson`}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium">Your Email</label>
              <input
                {...register('email')}
                className={`w-full p-4 border ${errors.email ? 'border-red-500' : 'border-silver'} bg-offwhite font-sans text-xs outline-none focus:border-crimson`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium">Subject</label>
            <input
              {...register('subject')}
              className={`w-full p-4 border ${errors.subject ? 'border-red-500' : 'border-silver'} bg-offwhite font-sans text-xs outline-none focus:border-crimson`}
              placeholder="How can we help?"
            />
            {errors.subject && <p className="text-[10px] text-red-500 mt-1">{errors.subject.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium">Message</label>
            <textarea
              {...register('message')}
              rows={5}
              className={`w-full p-4 border ${errors.message ? 'border-red-500' : 'border-silver'} bg-offwhite font-sans text-xs outline-none focus:border-crimson resize-none`}
              placeholder="Tell us more about your inquiry..."
            />
            {errors.message && <p className="text-[10px] text-red-500 mt-1">{errors.message.message}</p>}
          </div>

          <Button
            variant="crimson"
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </div>
    </section>
  );
}

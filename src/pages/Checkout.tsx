import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { OrderService } from '../services/OrderService';
import { StripeService } from '../services/StripeService';
import { stripePromise } from '../lib/stripe';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { SafeImage } from '../components/SafeImage';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { Truck, Package, Zap, ShieldCheck, Lock, Tag, ChevronRight, ArrowLeft } from 'lucide-react';

const checkoutSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name is too short'),
  lastName: z.string().min(2, 'Last name is too short'),
  address: z.string().min(5, 'Address is too short'),
  city: z.string().min(2, 'City is too short'),
  state: z.string().min(2, 'State / County is too short'),
  zip: z.string().min(4, 'ZIP / Postcode is too short'),
  country: z.string().min(2, 'Country is too short'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const DELIVERY_METHODS = [
  { id: 'standard', label: 'Standard Shipping', desc: '5-7 business days', price: 4.45, icon: Truck },
  { id: 'express', label: 'Express Shipping', desc: '2-3 business days', price: 9.95, icon: Zap },
  { id: 'next-day', label: 'Next Day Delivery', desc: 'Order before 12pm', price: 14.99, icon: Package },
];

export function CheckoutPage() {
  const { items, totalPrice, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState('standard');
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [orderError, setOrderError] = useState('');

  const stripe = useStripe();
  const elements = useElements();
  const isStripeReady = !!stripe && !!elements;
  const isMockMode = !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  const deliveryCost = DELIVERY_METHODS.find(d => d.id === selectedDelivery)?.price ?? 4.45;
  const discount = promoApplied ? totalPrice * 0.1 : 0;
  const grandTotal = totalPrice + deliveryCost - discount;

  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: user ? {
      email: user.email || '',
      firstName: user.displayName?.split(' ')[0] || '',
      lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
    } : {}
  });

  const handlePromo = () => {
    if (promoCode.toUpperCase() === 'CEEHATINATORS10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code.');
      setPromoApplied(false);
    }
  };

  const handleContinueToPayment = async () => {
    const valid = await trigger();
    if (valid) setStep('payment');
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    setIsSubmitting(true);
    setOrderError('');
    try {
      // 1. Create order in Firestore (status: pending)
      await OrderService.createOrder({
        userId: user.uid,
        items,
        total: grandTotal,
        shippingAddress: data,
        deliveryMethod: selectedDelivery,
        deliveryCost,
        promoCode: promoApplied ? promoCode : undefined,
      });

      // 2. Create Stripe checkout session (mock-safe)
      const session = await StripeService.createCheckoutSession({
        userId: user.uid,
        items,
        shippingAddress: data,
        deliveryMethod: selectedDelivery,
        deliveryCost,
        promoCode: promoApplied ? promoCode : undefined,
        successUrl: `${window.location.origin}/account`,
        cancelUrl: `${window.location.origin}/checkout`,
      });

      if (session.error) {
        setOrderError(session.error);
        return;
      }

      // 3. If real backend returns a hosted Checkout URL, leave the app for Stripe.
      if (!session.isMock) {
        if (session.checkoutUrl) {
          window.location.assign(session.checkoutUrl);
          return;
        }
        setOrderError('Checkout session was created, but no checkout URL was returned.');
        return;
      }

      // 4. Mock mode leaves the order pending; payment status belongs to a backend.
      clearCart();
      navigate('/account');
    } catch (e) {
      console.error(e);
      setOrderError('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Suppress unused var warning in mock mode
  void getValues;

  if (items.length === 0) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-32 text-center">
        <div className="w-16 h-16 border border-silver flex items-center justify-center mx-auto mb-8 text-mid-gray">
          <Package size={28} />
        </div>
        <h2 className="serif text-4xl font-light text-dark mb-4">Your bag is empty</h2>
        <p className="text-[13px] text-charcoal font-light mb-10">Add some items before proceeding to checkout.</p>
        <Button onClick={() => navigate('/shop')} variant="primary">Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="bg-offwhite min-h-screen">
      {/* Top bar */}
      <div className="border-b border-silver bg-white py-4 px-6 sm:px-10">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[11px] tracking-[1px] uppercase text-charcoal hover:text-crimson transition-colors">
            <ArrowLeft size={14} /> Back to Shop
          </Link>
          <div className="flex items-center gap-6 text-[10px] tracking-[1.5px] uppercase">
            <span className={`flex items-center gap-2 ${step === 'shipping' ? 'text-crimson font-semibold' : 'text-mid-gray'}`}>
              <span className={`w-5 h-5 flex items-center justify-center text-[9px] border ${step === 'shipping' ? 'border-crimson text-crimson' : 'border-silver text-silver'}`}>1</span>
              Shipping
            </span>
            <ChevronRight size={12} className="text-silver" />
            <span className={`flex items-center gap-2 ${step === 'payment' ? 'text-crimson font-semibold' : 'text-mid-gray'}`}>
              <span className={`w-5 h-5 flex items-center justify-center text-[9px] border ${step === 'payment' ? 'border-crimson text-crimson' : 'border-silver text-silver'}`}>2</span>
              Payment
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] tracking-[1px] text-mid-gray">
            <Lock size={11} /> Secure Checkout
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-10 sm:py-16">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-10 lg:gap-16">

          {/* Left: Form */}
          <div className="order-2 lg:order-1">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

              {/* ── STEP 1: SHIPPING ── */}
              {step === 'shipping' && (
                <>
                  {/* Contact */}
                  <section>
                    <h3 className="text-[10px] tracking-[3px] uppercase text-crimson mb-6 font-semibold flex items-center gap-3">
                      <span className="w-5 h-5 bg-crimson text-white flex items-center justify-center text-[9px]">1</span>
                      Contact Information
                    </h3>
                    <div className="space-y-1">
                      <label className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium">Email Address</label>
                      <input
                        {...register('email')}
                        className="w-full p-3.5 border border-silver bg-white font-sans text-[13px] outline-none focus:border-crimson transition-colors"
                        placeholder="you@example.com"
                      />
                      {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email.message}</p>}
                    </div>
                  </section>

                  {/* Shipping Address */}
                  <section>
                    <h3 className="text-[10px] tracking-[3px] uppercase text-crimson mb-6 font-semibold flex items-center gap-3">
                      <span className="w-5 h-5 bg-crimson text-white flex items-center justify-center text-[9px]">2</span>
                      Shipping Address
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {[
                        { name: 'firstName', label: 'First Name', placeholder: 'Jane' },
                        { name: 'lastName', label: 'Last Name', placeholder: 'Doe' },
                      ].map(f => (
                        <div key={f.name} className="space-y-1">
                          <label className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium">{f.label}</label>
                          <input
                            {...register(f.name as keyof CheckoutFormData)}
                            className="w-full p-3.5 border border-silver bg-white font-sans text-[13px] outline-none focus:border-crimson transition-colors"
                            placeholder={f.placeholder}
                          />
                          {errors[f.name as keyof CheckoutFormData] && (
                            <p className="text-[10px] text-red-500 mt-1">{errors[f.name as keyof CheckoutFormData]?.message}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium">Street Address</label>
                        <input {...register('address')} className="w-full p-3.5 border border-silver bg-white font-sans text-[13px] outline-none focus:border-crimson transition-colors" placeholder="123 Main Street" />
                        {errors.address && <p className="text-[10px] text-red-500 mt-1">{errors.address.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium">City</label>
                          <input {...register('city')} className="w-full p-3.5 border border-silver bg-white font-sans text-[13px] outline-none focus:border-crimson transition-colors" placeholder="London" />
                          {errors.city && <p className="text-[10px] text-red-500 mt-1">{errors.city.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium">State / County</label>
                          <input {...register('state')} className="w-full p-3.5 border border-silver bg-white font-sans text-[13px] outline-none focus:border-crimson transition-colors" placeholder="Greater London" />
                          {errors.state && <p className="text-[10px] text-red-500 mt-1">{errors.state.message}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium">Postcode</label>
                          <input {...register('zip')} className="w-full p-3.5 border border-silver bg-white font-sans text-[13px] outline-none focus:border-crimson transition-colors" placeholder="SW1A 1AA" />
                          {errors.zip && <p className="text-[10px] text-red-500 mt-1">{errors.zip.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium">Country</label>
                          <select {...register('country')} className="w-full p-3.5 border border-silver bg-white font-sans text-[13px] outline-none focus:border-crimson transition-colors">
                            <option value="">Select...</option>
                            <option value="GB">United Kingdom</option>
                            <option value="US">United States</option>
                            <option value="EU">European Union</option>
                            <option value="NG">Nigeria</option>
                            <option value="GH">Ghana</option>
                            <option value="ZA">South Africa</option>
                          </select>
                          {errors.country && <p className="text-[10px] text-red-500 mt-1">{errors.country.message}</p>}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Delivery Method */}
                  <section>
                    <h3 className="text-[10px] tracking-[3px] uppercase text-crimson mb-6 font-semibold flex items-center gap-3">
                      <span className="w-5 h-5 bg-crimson text-white flex items-center justify-center text-[9px]">3</span>
                      Delivery Method
                    </h3>
                    <div className="space-y-3">
                      {DELIVERY_METHODS.map(method => {
                        const Icon = method.icon;
                        return (
                          <label
                            key={method.id}
                            className={`flex items-center gap-4 p-4 border cursor-pointer transition-all duration-200 ${selectedDelivery === method.id ? 'border-crimson bg-white' : 'border-silver bg-white hover:border-charcoal'}`}
                          >
                            <input
                              type="radio"
                              name="delivery"
                              value={method.id}
                              checked={selectedDelivery === method.id}
                              onChange={() => setSelectedDelivery(method.id)}
                              className="accent-crimson"
                            />
                            <Icon size={18} className={selectedDelivery === method.id ? 'text-crimson' : 'text-mid-gray'} />
                            <div className="flex-1">
                              <div className="text-[12px] tracking-[1px] uppercase font-semibold text-dark">{method.label}</div>
                              <div className="text-[11px] text-mid-gray">{method.desc}</div>
                            </div>
                            <div className="text-[13px] font-medium text-dark">GBP {method.price.toFixed(2)}</div>
                          </label>
                        );
                      })}
                    </div>
                  </section>

                  <button
                    type="button"
                    onClick={handleContinueToPayment}
                    className="w-full bg-crimson text-white py-4 text-[11px] tracking-[2px] uppercase hover:bg-crimson-dark transition-colors cursor-pointer"
                  >
                    Continue to Payment -&gt;
                  </button>
                </>
              )}

              {step === 'payment' && (
                <>
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[10px] tracking-[3px] uppercase text-crimson font-semibold flex items-center gap-3">
                        <span className="w-5 h-5 bg-crimson text-white flex items-center justify-center text-[9px]">4</span>
                        Payment
                      </h3>
                      <button type="button" onClick={() => setStep('shipping')} className="text-[10px] tracking-[1px] uppercase text-mid-gray hover:text-crimson transition-colors">
                        ← Back
                      </button>
                    </div>

                    <div className="border border-silver bg-white p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[11px] tracking-[2px] uppercase text-dark font-semibold">Card Details</span>
                        <div className="flex gap-2">
                          {['Visa', 'MC', 'Amex'].map(b => (
                            <span key={b} className="px-2 py-0.5 border border-silver text-[9px] tracking-[1px] text-mid-gray">{b}</span>
                          ))}
                        </div>
                      </div>

                      {/* Stripe Elements mount (real) or placeholder (mock) */}
                      {!isMockMode && isStripeReady ? (
                        <div className="p-3.5 border border-silver bg-white">
                          <CardElement
                            options={{
                              style: {
                                base: {
                                  fontSize: '13px',
                                  color: '#343434',
                                  fontFamily: '"Josefin Sans", sans-serif',
                                  '::placeholder': { color: '#8d8788' },
                                },
                                invalid: { color: '#5c1120' },
                              },
                              hidePostalCode: true,
                            }}
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-3.5 border border-silver bg-offwhite text-[12px] text-mid-gray font-sans">
                            <span className="opacity-60">**** **** **** ****</span>
                            <span className="float-right opacity-60">MM / YY &nbsp; CVV</span>
                          </div>
                          <div className="p-3.5 border border-silver bg-offwhite h-12" />
                        </div>
                      )}

                      <div className="mt-6 p-4 bg-gold/10 border border-gold/30 text-[11px] text-charcoal leading-relaxed">
                        {isMockMode ? (
                          <><strong className="text-dark">Test / mock mode.</strong> Add <code className="bg-gold/20 px-1">VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...</code> to <code className="bg-gold/20 px-1">.env.local</code> to enable Stripe Elements. Clicking "Place Order" creates a pending test order without charging a card.</>
                        ) : (
                          <><strong className="text-dark">Stripe test mode.</strong> Use card <strong>4242 4242 4242 4242</strong>, any future expiry, and any 3-digit CVC to test a successful payment.</>
                        )}
                      </div>

                      {orderError && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-[11px] text-red-700">
                          {orderError}
                        </div>
                      )}

                      <div className="mt-6 flex items-center gap-2 text-[10px] tracking-[1px] text-mid-gray">
                        <ShieldCheck size={14} className="text-crimson" />
                        Your payment info is encrypted and never stored.
                      </div>
                    </div>
                  </section>

                  <button
                    type="submit"
                    disabled={isSubmitting || (!isMockMode && !isStripeReady)}
                    className="w-full bg-crimson text-white py-4 text-[11px] tracking-[2px] uppercase hover:bg-crimson-dark transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    <Lock size={14} />
                    {isSubmitting ? 'Processing...' : `Place Order - GBP ${grandTotal.toFixed(2)}`}
                  </button>
                </>
              )}
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="order-1 lg:order-2">
            <div className="bg-white border border-silver p-6 sm:p-8 sticky top-24">
              <h3 className="text-[10px] tracking-[3px] uppercase text-dark mb-6 font-semibold">Order Summary</h3>

              {/* Items */}
              <div className="space-y-5 mb-6 max-h-[280px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-20 shrink-0 bg-offwhite">
                      <SafeImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-2 -right-2 bg-crimson text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="serif text-[13px] text-dark leading-tight mb-1 truncate">{item.name}</div>
                      <div className="text-[10px] text-mid-gray tracking-[1px] uppercase mb-2">{item.category}</div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-5 h-5 border border-silver flex items-center justify-center text-charcoal hover:border-crimson text-xs">-</button>
                        <span className="text-[12px]">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-5 h-5 border border-silver flex items-center justify-center text-charcoal hover:border-crimson text-xs">+</button>
                        <button onClick={() => removeFromCart(item.id)} className="ml-auto text-[10px] text-mid-gray hover:text-crimson transition-colors">Remove</button>
                      </div>
                    </div>
                    <div className="text-[13px] font-medium text-dark shrink-0">
                      GBP {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 border border-silver px-3 bg-offwhite">
                    <Tag size={13} className="text-mid-gray shrink-0" />
                    <input
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      placeholder="Promo code"
                      className="w-full bg-transparent py-2.5 text-[12px] outline-none font-sans"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePromo}
                    className="px-4 border border-charcoal text-[10px] tracking-[1px] uppercase text-charcoal hover:bg-charcoal hover:text-white transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[10px] text-red-500 mt-1.5">{promoError}</p>}
                {promoApplied && <p className="text-[10px] text-green-600 mt-1.5">10% discount applied (CEEHATINATORS10)</p>}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-silver pt-5">
                <div className="flex justify-between text-[13px] text-charcoal">
                  <span>Subtotal</span>
                  <span>GBP {totalPrice.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-[13px] text-green-600">
                    <span>Discount (10%)</span>
                    <span>-GBP {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[13px] text-charcoal">
                  <span>Shipping</span>
                  <span>GBP {deliveryCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-silver">
                  <span className="text-[11px] tracking-[2px] uppercase font-semibold text-dark">Total</span>
                  <span className="serif text-2xl text-crimson font-light">GBP {grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/**
 * Wrap CheckoutPage in <Elements> so useStripe() / useElements() work.
 * stripePromise is null when VITE_STRIPE_PUBLISHABLE_KEY is not set —
 * @stripe/react-stripe-js handles null gracefully (hooks return null).
 */
export function CheckoutPageWithStripe() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutPage />
    </Elements>
  );
}

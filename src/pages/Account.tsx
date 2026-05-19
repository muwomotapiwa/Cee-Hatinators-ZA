import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Package, Heart, MapPin, Clock, RotateCcw, User, ChevronRight, LogOut, ShoppingBag } from 'lucide-react';
import { SafeImage } from '../components/SafeImage';
import { PLACEHOLDER_IMAGES } from '../lib/imagePlaceholders';

const MOCK_ORDERS = [
  {
    id: 'CEE-2026-0041',
    date: '10 May 2026',
    status: 'Delivered',
    statusColor: 'text-green-600',
    items: [
      { name: 'Azure Orchid Hatinator', qty: 1, price: 15.89, image: PLACEHOLDER_IMAGES.headwrap },
    ],
    total: 20.34,
  },
  {
    id: 'CEE-2026-0038',
    date: '2 May 2026',
    status: 'In Transit',
    statusColor: 'text-gold',
    items: [
      { name: 'Royal Plum Fascinator', qty: 1, price: 32.00, image: PLACEHOLDER_IMAGES.accessories },
      { name: 'Luxury Satin Sleep Bonnet', qty: 2, price: 25.00, image: PLACEHOLDER_IMAGES.bonnet },
    ],
    total: 66.90,
  },
];

const NAV_ITEMS = [
  { id: 'orders', label: 'Order History', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { id: 'track', label: 'Track Order', icon: Clock },
  { id: 'returns', label: 'Returns', icon: RotateCcw },
  { id: 'details', label: 'Account Details', icon: User },
];

export function AccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <User size={40} className="mx-auto mb-6 text-mid-gray" />
          <h2 className="serif text-3xl font-light text-dark mb-4">Sign In to View Your Account</h2>
          <p className="text-[13px] text-charcoal font-light mb-8">Please sign in using the icon in the header to access your account.</p>
          <button onClick={() => navigate('/')} className="text-[11px] tracking-[2px] uppercase text-crimson border-b border-crimson pb-0.5 hover:text-crimson-dark">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-offwhite min-h-screen py-10 sm:py-16">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">

        {/* Header */}
        <div className="mb-10 sm:mb-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {user.photoURL
              ? <SafeImage src={user.photoURL} alt={user.displayName || ''} className="w-14 h-14 rounded-full border border-silver object-cover" />
              : <div className="w-14 h-14 bg-crimson text-white flex items-center justify-center serif text-2xl font-light">{(user.displayName || user.email || 'U')[0].toUpperCase()}</div>
            }
            <div>
              <h1 className="serif text-3xl sm:text-4xl font-light text-dark leading-tight">
                {user.displayName || 'My Account'}
              </h1>
              <p className="text-[12px] text-mid-gray tracking-[0.5px]">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[11px] tracking-[2px] uppercase text-mid-gray hover:text-crimson transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Sidebar Nav */}
          <aside className="w-full lg:w-[220px] shrink-0">
            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 text-[11px] tracking-[1px] uppercase whitespace-nowrap shrink-0 transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-crimson text-white'
                        : 'text-charcoal hover:text-crimson hover:bg-white border border-transparent hover:border-silver'
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">

            {/* ── ORDER HISTORY ── */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-[11px] tracking-[3px] uppercase text-dark mb-8 font-semibold border-b border-silver pb-4">Order History</h2>
                {MOCK_ORDERS.length === 0 ? (
                  <div className="text-center py-20">
                    <ShoppingBag size={40} className="mx-auto mb-4 text-mid-gray" />
                    <p className="text-[13px] text-charcoal">No orders yet.</p>
                    <Link to="/shop" className="text-[11px] tracking-[1px] uppercase text-crimson border-b border-crimson mt-4 inline-block">Shop Now</Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {MOCK_ORDERS.map(order => (
                      <div key={order.id} className="bg-white border border-silver p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-5 pb-4 border-b border-silver">
                          <div>
                            <span className="text-[11px] tracking-[2px] uppercase font-semibold text-dark">{order.id}</span>
                            <span className="ml-4 text-[11px] text-mid-gray">{order.date}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-[11px] tracking-[1px] uppercase font-semibold ${order.statusColor}`}>{order.status}</span>
                            <span className="text-[13px] font-medium text-dark">GBP {order.total.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex gap-4">
                              <SafeImage src={item.image} alt={item.name} className="w-14 h-16 object-cover shrink-0 bg-offwhite" />
                              <div>
                                <div className="serif text-[14px] text-dark">{item.name}</div>
                                <div className="text-[11px] text-mid-gray mt-1">Qty: {item.qty} / GBP {item.price.toFixed(2)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-4 mt-5 pt-4 border-t border-silver">
                          <button className="text-[10px] tracking-[1.5px] uppercase text-charcoal hover:text-crimson transition-colors">View Order</button>
                          <button className="text-[10px] tracking-[1.5px] uppercase text-charcoal hover:text-crimson transition-colors">Track Shipment</button>
                          <button className="text-[10px] tracking-[1.5px] uppercase text-charcoal hover:text-crimson transition-colors">Reorder</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── WISHLIST ── */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-[11px] tracking-[3px] uppercase text-dark mb-8 font-semibold border-b border-silver pb-4">My Wishlist</h2>
                <div className="text-center py-20 text-charcoal">
                  <Heart size={40} className="mx-auto mb-4 text-mid-gray" />
                  <p className="text-[13px] font-light mb-6">Your wishlist is empty. Save items while browsing.</p>
                  <Link to="/shop" className="text-[11px] tracking-[2px] uppercase text-crimson border-b border-crimson pb-0.5">Browse Collection</Link>
                </div>
              </div>
            )}

            {/* ── ADDRESSES ── */}
            {activeTab === 'addresses' && (
              <div>
                <h2 className="text-[11px] tracking-[3px] uppercase text-dark mb-8 font-semibold border-b border-silver pb-4">Saved Addresses</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-crimson p-5 relative">
                    <span className="absolute top-3 right-3 text-[9px] tracking-[1.5px] uppercase text-crimson font-semibold">Default</span>
                    <MapPin size={16} className="text-crimson mb-3" />
                    <p className="text-[13px] text-dark font-medium mb-1">{user.displayName || 'Your Name'}</p>
                    <p className="text-[12px] text-charcoal leading-relaxed">
                      123 Example Street<br />London, SW1A 1AA<br />United Kingdom
                    </p>
                    <div className="flex gap-4 mt-4 pt-4 border-t border-silver">
                      <button className="text-[10px] tracking-[1px] uppercase text-charcoal hover:text-crimson transition-colors">Edit</button>
                      <button className="text-[10px] tracking-[1px] uppercase text-charcoal hover:text-crimson transition-colors">Remove</button>
                    </div>
                  </div>
                  <button className="border border-dashed border-silver p-5 flex flex-col items-center justify-center gap-2 text-mid-gray hover:border-crimson hover:text-crimson transition-colors min-h-[140px]">
                    <span className="text-2xl">+</span>
                    <span className="text-[10px] tracking-[1.5px] uppercase">Add New Address</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── TRACK ORDER ── */}
            {activeTab === 'track' && (
              <div>
                <h2 className="text-[11px] tracking-[3px] uppercase text-dark mb-8 font-semibold border-b border-silver pb-4">Track Your Order</h2>
                <div className="bg-white border border-silver p-8">
                  <p className="text-[13px] text-charcoal mb-6 font-light">Enter your order number to get real-time tracking updates.</p>
                  <div className="flex gap-3">
                    <input
                      placeholder="Order ID (e.g. CEE-2026-0041)"
                      className="flex-1 p-3.5 border border-silver font-sans text-[13px] outline-none focus:border-crimson transition-colors"
                    />
                    <button className="px-6 bg-crimson text-white text-[10px] tracking-[2px] uppercase hover:bg-crimson-dark transition-colors">Track</button>
                  </div>
                  <div className="mt-8 pt-8 border-t border-silver">
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 shrink-0" />
                      <div>
                        <div className="text-[12px] font-semibold text-dark">Delivered - 10 May 2026</div>
                        <div className="text-[11px] text-mid-gray">Your package was delivered to the front door.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── RETURNS ── */}
            {activeTab === 'returns' && (
              <div>
                <h2 className="text-[11px] tracking-[3px] uppercase text-dark mb-8 font-semibold border-b border-silver pb-4">Returns & Refunds</h2>
                <div className="bg-white border border-silver p-8 text-[13px] text-charcoal font-light leading-relaxed space-y-4">
                  <p>We want you to love your Cee Hatinators purchase. If you're not completely satisfied, we accept returns within <strong className="text-dark">30 days</strong> of delivery.</p>
                  <p>Items must be unused, unworn, and in their original packaging. Bespoke or altered pieces are non-refundable.</p>
                  <div className="mt-6 flex gap-4">
                    <button className="px-6 py-3 bg-crimson text-white text-[10px] tracking-[2px] uppercase hover:bg-crimson-dark transition-colors">Start a Return</button>
                    <Link to="/faq" className="px-6 py-3 border border-silver text-[10px] tracking-[2px] uppercase text-charcoal hover:border-charcoal transition-colors">View FAQ</Link>
                  </div>
                </div>
              </div>
            )}

            {/* ── ACCOUNT DETAILS ── */}
            {activeTab === 'details' && (
              <div>
                <h2 className="text-[11px] tracking-[3px] uppercase text-dark mb-8 font-semibold border-b border-silver pb-4">Account Details</h2>
                <div className="bg-white border border-silver p-6 sm:p-8 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium">Display Name</label>
                      <input defaultValue={user.displayName || ''} className="w-full p-3.5 border border-silver font-sans text-[13px] outline-none focus:border-crimson transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium">Email</label>
                      <input defaultValue={user.email || ''} disabled className="w-full p-3.5 border border-silver font-sans text-[13px] outline-none bg-offwhite text-mid-gray cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-[11px] text-mid-gray mb-4">Signed in via Google. Password management is handled through your Google account.</p>
                    <button className="px-6 py-3 bg-crimson text-white text-[10px] tracking-[2px] uppercase hover:bg-crimson-dark transition-colors">Save Changes</button>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

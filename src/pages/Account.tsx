import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, LogOut, LucideIcon, MapPin, Package, RotateCcw, Save, Search, Shield, Truck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { SafeImage } from '../components/SafeImage';
import { PLACEHOLDER_IMAGES } from '../lib/imagePlaceholders';
import { formatMoney } from '../lib/money';
import { ProductService } from '../services/ProductService';
import type { Product } from '../types';
import {
  AccountProfile,
  AccountService,
  AddressInput,
  CustomerCartItemRow,
  CustomerAddress,
  CustomerOrder,
  ReturnRequest,
  WishlistItemRow,
} from '../services/AccountService';

const CUSTOMER_TABS = [
  { id: 'orders', label: 'Order History', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { id: 'track', label: 'Track Order', icon: Truck },
  { id: 'returns', label: 'Returns', icon: RotateCcw },
  { id: 'details', label: 'Account Details', icon: User },
];

const SUPER_USER_SECTIONS = [
  { id: 'users', label: 'Users' },
  { id: 'orders', label: 'Orders' },
  { id: 'returns', label: 'Returns' },
  { id: 'wishlist', label: 'Wishlist Items' },
  { id: 'bag', label: 'Bag Items' },
  { id: 'addresses', label: 'Addresses' },
];

const ORDER_STATUS_OPTIONS: CustomerOrder['status'][] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
const RETURN_STATUS_OPTIONS: ReturnRequest['status'][] = ['requested', 'reviewing', 'approved', 'declined', 'received', 'refunded', 'closed'];

const emptyAddress = (userId: string): AddressInput => ({
  user_id: userId,
  label: 'Delivery',
  full_name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  province: '',
  postal_code: '',
  country: 'South Africa',
  is_default: false,
  status: 'active',
});

function formatDate(value?: string | null) {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(new Date(value));
}

function orderTotal(order: CustomerOrder) {
  return formatMoney((order.total_minor || 0) / 100, order.currency || 'ZAR');
}

function statusLabel(value: string) {
  return value.replace(/_/g, ' ');
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return 'Could not save the record. Please check the fields and try again.';
}

function validateAddress(address: CustomerAddress | AddressInput) {
  if (!address.user_id) return 'Choose a customer first.';
  if (!address.full_name.trim()) return 'Full name is required for delivery.';
  if (!address.phone.trim()) return 'Phone number is required for delivery.';
  if (!address.line1.trim()) return 'Address line 1 is required for delivery.';
  if (!address.city.trim()) return 'City or suburb is required for delivery.';
  if (!address.province?.trim()) return 'Province is required for delivery.';
  if (!address.postal_code?.trim()) return 'Postcode is required for delivery.';
  if (!address.country.trim()) return 'Country is required for delivery.';
  return '';
}

function profileLabel(profiles: AccountProfile[], userId: string) {
  const profile = profiles.find((item) => item.id === userId);
  return profile?.full_name || profile?.email || userId;
}

export function AccountPage() {
  const { user, profile, isSuperUser, signOut, refreshProfile } = useAuth();
  const { productIds, refreshWishlist } = useWishlist();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(CUSTOMER_TABS.some((tab) => tab.id === requestedTab) ? requestedTab : 'orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [profiles, setProfiles] = useState<AccountProfile[]>([]);
  const [allAddresses, setAllAddresses] = useState<CustomerAddress[]>([]);
  const [allOrders, setAllOrders] = useState<CustomerOrder[]>([]);
  const [allReturns, setAllReturns] = useState<ReturnRequest[]>([]);
  const [allWishlist, setAllWishlist] = useState<WishlistItemRow[]>([]);
  const [allCartItems, setAllCartItems] = useState<CustomerCartItemRow[]>([]);
  const [superUserSection, setSuperUserSection] = useState('users');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userSearch, setUserSearch] = useState('');
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', role: 'general_user' });
  const [addressDraft, setAddressDraft] = useState<AddressInput | null>(null);
  const [trackQuery, setTrackQuery] = useState('');
  const [returnForm, setReturnForm] = useState({ order_id: '', reason: '', message: '' });
  const [message, setMessage] = useState('');

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const wishlistProducts = productIds.map((id) => productById.get(id)).filter((item): item is Product => Boolean(item));
  const selectedProfile = profiles.find((item) => item.id === selectedUserId) || profiles[0] || null;
  const selectedCustomerLabel = selectedProfile ? profileLabel(profiles, selectedProfile.id) : 'No customer selected';
  const selectedOrders = allOrders.filter((order) => order.user_id === selectedProfile?.id);
  const selectedAddresses = allAddresses.filter((address) => address.user_id === selectedProfile?.id);
  const selectedReturns = allReturns.filter((item) => item.user_id === selectedProfile?.id);
  const selectedWishlist = allWishlist.filter((item) => item.user_id === selectedProfile?.id);
  const selectedCartItems = allCartItems.filter((item) => item.user_id === selectedProfile?.id);
  const filteredProfiles = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return profiles;
    return profiles.filter((item) => [
      item.full_name,
      item.email,
      item.phone,
      item.role,
    ].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [profiles, userSearch]);
  const trackedOrder = orders.find((order) => {
    const query = trackQuery.trim().toLowerCase();
    if (!query) return false;
    return order.order_number.toLowerCase() === query || order.id.toLowerCase() === query;
  });

  const loadCustomerData = async () => {
    if (!user) return;

    const [productData, addressData, orderData, returnData] = await Promise.all([
      ProductService.getProducts(),
      AccountService.getAddresses(user.id),
      AccountService.getOrders(user.id),
      AccountService.getReturnRequests(user.id),
      refreshWishlist(),
    ]).then(([productData, addressData, orderData, returnData]) => [productData, addressData, orderData, returnData]);

    setProducts(productData);
    setAddresses(addressData);
    setOrders(orderData);
    setReturns(returnData);
  };

  const loadSuperUserData = async () => {
    const [profileData, addressData, orderData, returnData, wishlistData, cartItemData, productData] = await Promise.all([
      AccountService.getProfiles(),
      AccountService.getAddresses(),
      AccountService.getOrders(),
      AccountService.getReturnRequests(),
      AccountService.getWishlistItems(),
      AccountService.getCartItems(),
      ProductService.getProducts(),
    ]);

    setProfiles(profileData);
    setAllAddresses(addressData);
    setAllOrders(orderData);
    setAllReturns(returnData);
    setAllWishlist(wishlistData);
    setAllCartItems(cartItemData);
    setProducts(productData);
    setSelectedUserId((current) => current || profileData[0]?.id || '');
  };

  useEffect(() => {
    if (!user) return;

    setProfileForm({
      full_name: profile?.full_name || user.displayName || '',
      phone: profile?.phone || '',
      role: profile?.role || 'general_user',
    });

    loadCustomerData();
    if (isSuperUser) loadSuperUserData();
  }, [user?.id, profile?.id, isSuperUser]);

  useEffect(() => {
    if (!selectedProfile) return;
    setProfileForm({
      full_name: selectedProfile.full_name || '',
      phone: selectedProfile.phone || '',
      role: selectedProfile.role,
    });
  }, [selectedProfile?.id]);

  useEffect(() => {
    if (CUSTOMER_TABS.some((tab) => tab.id === requestedTab)) setActiveTab(requestedTab);
  }, [requestedTab]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const saveProfile = async (targetId = user?.id) => {
    if (!targetId) return;

    await AccountService.updateProfile(targetId, {
      full_name: profileForm.full_name,
      phone: profileForm.phone,
      role: isSuperUser ? profileForm.role as AccountProfile['role'] : undefined,
    });

    await refreshProfile();
    await loadSuperUserData();
    setMessage('Account details saved.');
  };

  const saveAddress = async (event: FormEvent) => {
    event.preventDefault();
    if (!addressDraft) return;

    const validationMessage = validateAddress(addressDraft);
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    try {
      await AccountService.saveAddress(addressDraft);
      setAddressDraft(null);
      await loadCustomerData();
      setMessage('Address saved.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  const archiveAddress = async (id?: string) => {
    if (!id) return;
    await AccountService.archiveAddress(id);
    await loadCustomerData();
    setMessage('Address removed.');
  };

  const createReturn = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !returnForm.reason.trim()) return;

    await AccountService.createReturnRequest({
      user_id: user.id,
      order_id: returnForm.order_id || null,
      reason: returnForm.reason,
      message: returnForm.message,
    });

    setReturnForm({ order_id: '', reason: '', message: '' });
    await loadCustomerData();
    setMessage('Return request submitted.');
  };

  const saveAdminAddress = async (address: CustomerAddress) => {
    const validationMessage = validateAddress(address);
    if (validationMessage) throw new Error(validationMessage);

    await AccountService.saveAddress(address);
    await loadSuperUserData();
    setMessage('Address updated.');
  };

  const archiveAdminAddress = async (id?: string) => {
    if (!id) return;
    await AccountService.archiveAddress(id);
    await loadSuperUserData();
    setMessage('Address archived.');
  };

  const saveAdminOrder = async (order: CustomerOrder) => {
    await AccountService.updateOrder(order.id, {
      status: order.status,
      tracking_number: order.tracking_number,
      tracking_url: order.tracking_url,
      carrier: order.carrier,
      subtotal_minor: order.subtotal_minor,
      delivery_minor: order.delivery_minor,
      total_minor: order.total_minor,
      currency: order.currency,
    });
    await loadSuperUserData();
    setMessage('Order updated.');
  };

  const saveAdminReturn = async (item: ReturnRequest) => {
    await AccountService.updateReturnRequest(item.id, {
      reason: item.reason,
      message: item.message,
      status: item.status,
    });
    await loadSuperUserData();
    setMessage('Return request updated.');
  };

  const saveAdminWishlist = async (item: WishlistItemRow, nextProductSlug: string) => {
    if (!nextProductSlug.trim()) return;
    await AccountService.replaceWishlistItem({
      userId: item.user_id,
      oldProductSlug: item.product_slug,
      newProductSlug: nextProductSlug.trim(),
    });
    await loadSuperUserData();
    setMessage('Wishlist item updated.');
  };

  const deleteAdminWishlist = async (item: WishlistItemRow) => {
    await AccountService.deleteWishlistItem(item.user_id, item.product_slug);
    await loadSuperUserData();
    setMessage('Wishlist item removed.');
  };

  const saveAdminCartItem = async (item: CustomerCartItemRow, nextProductSlug: string, quantity: number) => {
    if (!nextProductSlug.trim()) throw new Error('Choose a product first.');
    if (quantity < 1) throw new Error('Quantity must be at least 1.');
    const product = products.find((candidate) => candidate.id === nextProductSlug.trim()) || null;

    await AccountService.replaceCartItem({
      userId: item.user_id,
      oldProductSlug: item.product_slug,
      newProductSlug: nextProductSlug.trim(),
      quantity: Math.max(1, quantity),
      itemSnapshot: product,
    });
    await loadSuperUserData();
    setMessage('Bag item updated.');
  };

  const deleteAdminCartItem = async (item: CustomerCartItemRow) => {
    await AccountService.deleteCartItem(item.user_id, item.product_slug);
    await loadSuperUserData();
    setMessage('Bag item removed.');
  };

  const addAdminCartItem = async (userId: string, productSlug: string, quantity: number) => {
    if (!userId) throw new Error('Choose a customer first.');
    if (!productSlug) throw new Error('Choose a product first.');
    if (quantity < 1) throw new Error('Quantity must be at least 1.');
    const product = products.find((candidate) => candidate.id === productSlug) || null;

    await AccountService.upsertCartItem({
      userId,
      productSlug,
      quantity: Math.max(1, quantity),
      itemSnapshot: product,
    });
    await loadSuperUserData();
    setMessage('Bag item added.');
  };

  if (!user) return null;

  if (isSuperUser) {
    return (
      <div className="bg-offwhite min-h-screen py-10 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <span className="text-[10px] tracking-[3px] uppercase text-crimson block mb-3">Super User Account</span>
              <h1 className="serif text-4xl sm:text-5xl font-light text-dark">Customer Dashboard</h1>
              <p className="text-[12px] text-charcoal mt-3">View all users, customer records, wishlist items, addresses, orders, and returns.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/portal" className="px-5 py-3 bg-crimson text-white text-[10px] tracking-[2px] uppercase">Portal</Link>
              <button onClick={handleLogout} className="px-5 py-3 border border-silver text-[10px] tracking-[2px] uppercase text-charcoal">Sign Out</button>
            </div>
          </div>

          {message && <div className="mb-6 border border-crimson/30 bg-white px-5 py-3 text-[12px] text-crimson">{message}</div>}

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { id: 'users', label: 'Users', value: profiles.length, meta: 'All users' },
              { id: 'orders', label: 'Orders', value: selectedOrders.length, meta: `All orders ${allOrders.length}` },
              { id: 'returns', label: 'Returns', value: selectedReturns.length, meta: `All returns ${allReturns.length}` },
              { id: 'wishlist', label: 'Wishlist Items', value: selectedWishlist.length, meta: `All wishlist ${allWishlist.length}` },
              { id: 'bag', label: 'Bag Items', value: selectedCartItems.length, meta: `All bag ${allCartItems.length}` },
              { id: 'addresses', label: 'Addresses', value: selectedAddresses.length, meta: `All addresses ${allAddresses.length}` },
            ].map(({ id, label, value, meta }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSuperUserSection(id)}
                className={`bg-white border p-5 text-left transition-colors ${superUserSection === id ? 'border-crimson bg-white' : 'border-silver hover:border-crimson'}`}
              >
                <div className="text-[10px] tracking-[2px] uppercase text-mid-gray mb-2">{label}</div>
                <div className="serif text-4xl text-dark">{value}</div>
                <div className="mt-2 text-[9px] tracking-[1.5px] uppercase text-mid-gray">{meta}</div>
              </button>
            ))}
          </div>

          <div className="mb-6 border border-silver bg-white px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-[10px] tracking-[2px] uppercase text-mid-gray">Selected Customer</div>
              <div className="serif text-2xl text-dark">{selectedCustomerLabel}</div>
              {selectedProfile && <div className="text-[11px] text-mid-gray">{selectedProfile.email}</div>}
            </div>
            <button type="button" onClick={() => setSuperUserSection('users')} className="border border-silver px-4 py-2 text-[10px] tracking-[2px] uppercase text-charcoal hover:border-crimson">
              Change User
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {SUPER_USER_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setSuperUserSection(section.id)}
                className={`px-4 py-2 text-[10px] tracking-[2px] uppercase border transition-colors ${superUserSection === section.id ? 'bg-crimson text-white border-crimson' : 'bg-white text-charcoal border-silver hover:border-crimson'}`}
              >
                {section.label}
              </button>
            ))}
          </div>

          {superUserSection === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
              <SuperUserList profiles={filteredProfiles} allCount={profiles.length} search={userSearch} setSearch={setUserSearch} selectedProfile={selectedProfile} onSelect={setSelectedUserId} />
              {selectedProfile && (
                <main className="space-y-6">
                  <section className="bg-white border border-silver p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Shield size={18} className="text-crimson" />
                      <h2 className="serif text-3xl text-dark">User Details</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <label className="space-y-2">
                        <span className="text-[10px] tracking-[2px] uppercase text-charcoal">Full Name</span>
                        <input value={profileForm.full_name} onChange={(event) => setProfileForm((current) => ({ ...current, full_name: event.target.value }))} className="w-full border border-silver p-3 text-[13px] outline-none focus:border-crimson" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-[10px] tracking-[2px] uppercase text-charcoal">Phone</span>
                        <input value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} className="w-full border border-silver p-3 text-[13px] outline-none focus:border-crimson" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-[10px] tracking-[2px] uppercase text-charcoal">Role</span>
                        <select value={profileForm.role} onChange={(event) => setProfileForm((current) => ({ ...current, role: event.target.value }))} className="w-full border border-silver p-3 text-[13px] outline-none focus:border-crimson bg-white">
                          <option value="general_user">general_user</option>
                          <option value="super_user">super_user</option>
                        </select>
                      </label>
                    </div>
                    <button onClick={() => saveProfile(selectedProfile.id)} className="mt-5 inline-flex items-center gap-2 bg-crimson text-white px-6 py-3 text-[10px] tracking-[2px] uppercase">
                      <Save size={14} /> Save User
                    </button>
                  </section>

                  <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <SummaryPanel title="Orders" empty="No orders yet.">
                      {selectedOrders.map((order) => <div key={order.id}><OrderCard order={order} /></div>)}
                    </SummaryPanel>
                    <SummaryPanel title="Wishlist" empty="No wishlist items yet.">
                      {selectedWishlist.map((item) => {
                        const product = productById.get(item.product_slug);
                        return <div key={`${item.user_id}-${item.product_slug}`}><SmallRow title={product?.name || item.product_slug} meta={formatDate(item.created_at)} /></div>;
                      })}
                    </SummaryPanel>
                    <SummaryPanel title="Bag Items" empty="No bag items yet.">
                      {selectedCartItems.map((item) => {
                        const product = productById.get(item.product_slug) || item.item_snapshot;
                        return <div key={`${item.user_id}-${item.product_slug}`}><SmallRow title={product?.name || item.product_slug} meta={`Qty ${item.quantity}`} /></div>;
                      })}
                    </SummaryPanel>
                    <SummaryPanel title="Addresses" empty="No saved addresses yet.">
                      {selectedAddresses.map((address) => <div key={address.id}><AddressCard address={address} /></div>)}
                    </SummaryPanel>
                    <SummaryPanel title="Returns" empty="No return requests yet.">
                      {selectedReturns.map((item) => <div key={item.id}><SmallRow title={item.reason} meta={statusLabel(item.status)} /></div>)}
                    </SummaryPanel>
                  </section>
                </main>
              )}
            </div>
          )}

          {superUserSection === 'orders' && (
            <AdminOrdersTable orders={selectedOrders} profiles={profiles} customer={selectedCustomerLabel} onSave={saveAdminOrder} />
          )}

          {superUserSection === 'returns' && (
            <AdminReturnsTable returns={selectedReturns} orders={allOrders} profiles={profiles} customer={selectedCustomerLabel} onSave={saveAdminReturn} />
          )}

          {superUserSection === 'wishlist' && (
            <AdminWishlistTable wishlist={selectedWishlist} profiles={profiles} products={products} customer={selectedCustomerLabel} onSave={saveAdminWishlist} onDelete={deleteAdminWishlist} />
          )}

          {superUserSection === 'bag' && (
            <AdminCartTable cartItems={selectedCartItems} profiles={profiles} selectedProfile={selectedProfile} products={products} onAdd={addAdminCartItem} onSave={saveAdminCartItem} onDelete={deleteAdminCartItem} />
          )}

          {superUserSection === 'addresses' && (
            <AdminAddressesTable addresses={selectedAddresses} profiles={profiles} selectedProfile={selectedProfile} onSave={saveAdminAddress} onArchive={archiveAdminAddress} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-offwhite min-h-screen py-10 sm:py-16">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        <div className="mb-10 sm:mb-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {user.photoURL
              ? <SafeImage src={user.photoURL} alt={user.displayName || ''} className="w-14 h-14 rounded-full border border-silver object-cover" />
              : <div className="w-14 h-14 bg-crimson text-white flex items-center justify-center serif text-2xl font-light">{(user.displayName || user.email || 'U')[0].toUpperCase()}</div>
            }
            <div>
              <span className="text-[10px] tracking-[2px] uppercase text-crimson">Customer Account</span>
              <h1 className="serif text-3xl sm:text-4xl font-light text-dark leading-tight">{profile?.full_name || user.displayName || 'My Account'}</h1>
              <p className="text-[12px] text-mid-gray tracking-[0.5px]">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-[11px] tracking-[2px] uppercase text-mid-gray hover:text-crimson transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {message && <div className="mb-6 border border-crimson/30 bg-white px-5 py-3 text-[12px] text-crimson">{message}</div>}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <aside className="w-full lg:w-[230px] shrink-0">
            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {CUSTOMER_TABS.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-3 px-4 py-3 text-[11px] tracking-[1px] uppercase whitespace-nowrap shrink-0 transition-all ${activeTab === item.id ? 'bg-crimson text-white' : 'text-charcoal hover:text-crimson hover:bg-white border border-transparent hover:border-silver'}`}>
                    <Icon size={14} /> {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1">
            {activeTab === 'orders' && (
              <PanelTitle title="Order History" />
            )}
            {activeTab === 'orders' && (
              <div className="space-y-5">
                {orders.length === 0 ? <EmptyState icon={Package} text="No orders yet." action={<Link to="/shop" className="text-[11px] tracking-[2px] uppercase text-crimson border-b border-crimson">Shop Now</Link>} /> : orders.map((order) => <div key={order.id}><OrderCard order={order} /></div>)}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <>
                <PanelTitle title="My Wishlist" />
                {wishlistProducts.length === 0 ? (
                  <EmptyState icon={Heart} text="Your wishlist is empty. Save items while browsing." action={<Link to="/shop" className="text-[11px] tracking-[2px] uppercase text-crimson border-b border-crimson">Browse Collection</Link>} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {wishlistProducts.map((product) => (
                      <Link key={product.id} to={`/product/${product.id}`} className="bg-white border border-silver p-4 hover:border-crimson transition-colors">
                        <SafeImage src={product.image} alt={product.name} className="w-full aspect-[4/5] object-cover bg-offwhite mb-4" />
                        <h3 className="serif text-xl text-dark">{product.name}</h3>
                        <p className="text-[10px] tracking-[1.5px] uppercase text-mid-gray mt-1">{product.variant}</p>
                        <p className="text-[13px] text-crimson mt-3">{formatMoney(product.price, product.currency)}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'addresses' && (
              <>
                <PanelTitle title="Saved Addresses" />
                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(420px,540px)] gap-6 items-start">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 self-start">
                    {addresses.map((address) => (
                      <div key={address.id}><AddressCard address={address} onEdit={() => setAddressDraft(address)} onRemove={() => archiveAddress(address.id)} /></div>
                    ))}
                    <button onClick={() => setAddressDraft(emptyAddress(user.id))} className="border border-dashed border-silver p-5 flex flex-col items-center justify-center gap-2 text-mid-gray hover:border-crimson hover:text-crimson transition-colors min-h-[150px]">
                      <span className="text-2xl">+</span>
                      <span className="text-[10px] tracking-[1.5px] uppercase">Add Address</span>
                    </button>
                  </div>
                  {addressDraft && <AddressForm draft={addressDraft} setDraft={setAddressDraft} onSubmit={saveAddress} onCancel={() => setAddressDraft(null)} />}
                </div>
              </>
            )}

            {activeTab === 'track' && (
              <>
                <PanelTitle title="Track Order" />
                <div className="bg-white border border-silver p-8">
                  <p className="text-[13px] text-charcoal mb-6">Enter one of your order numbers to view tracking. This area is view-only for customers.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input value={trackQuery} onChange={(event) => setTrackQuery(event.target.value)} placeholder="Order number" className="flex-1 p-3.5 border border-silver text-[13px] outline-none focus:border-crimson" />
                    <button className="px-6 bg-crimson text-white text-[10px] tracking-[2px] uppercase py-3.5"><Search size={14} className="inline mr-2" />Search</button>
                  </div>
                  {trackQuery && (
                    <div className="mt-8 border-t border-silver pt-6">
                      {trackedOrder ? <OrderCard order={trackedOrder} showTracking /> : <p className="text-[13px] text-mid-gray">No matching order found on your account.</p>}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'returns' && (
              <>
                <PanelTitle title="Returns" />
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
                  <div className="space-y-4">
                    {returns.length === 0 ? <EmptyState icon={RotateCcw} text="No return requests yet." /> : returns.map((item) => <div key={item.id}><SmallRow title={item.reason} meta={`${statusLabel(item.status)} / ${formatDate(item.created_at)}`} /></div>)}
                  </div>
                  <form onSubmit={createReturn} className="bg-white border border-silver p-6 space-y-4">
                    <h3 className="serif text-2xl text-dark">Request Return</h3>
                    <label className="space-y-2 block">
                      <span className="text-[10px] tracking-[2px] uppercase text-charcoal">Order</span>
                      <select value={returnForm.order_id} onChange={(event) => setReturnForm((current) => ({ ...current, order_id: event.target.value }))} className="w-full border border-silver p-3 text-[13px] bg-white outline-none focus:border-crimson">
                        <option value="">Select order</option>
                        {orders.map((order) => <option key={order.id} value={order.id}>{order.order_number}</option>)}
                      </select>
                    </label>
                    <label className="space-y-2 block">
                      <span className="text-[10px] tracking-[2px] uppercase text-charcoal">Reason</span>
                      <input value={returnForm.reason} onChange={(event) => setReturnForm((current) => ({ ...current, reason: event.target.value }))} className="w-full border border-silver p-3 text-[13px] outline-none focus:border-crimson" />
                    </label>
                    <label className="space-y-2 block">
                      <span className="text-[10px] tracking-[2px] uppercase text-charcoal">Message</span>
                      <textarea value={returnForm.message} onChange={(event) => setReturnForm((current) => ({ ...current, message: event.target.value }))} className="w-full border border-silver p-3 text-[13px] outline-none focus:border-crimson min-h-28" />
                    </label>
                    <button className="w-full bg-crimson text-white py-3 text-[10px] tracking-[2px] uppercase">Submit Return</button>
                  </form>
                </div>
              </>
            )}

            {activeTab === 'details' && (
              <>
                <PanelTitle title="Account Details" />
                <div className="bg-white border border-silver p-6 sm:p-8 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <label className="space-y-2">
                      <span className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium">Full Name</span>
                      <input value={profileForm.full_name} onChange={(event) => setProfileForm((current) => ({ ...current, full_name: event.target.value }))} className="w-full p-3.5 border border-silver text-[13px] outline-none focus:border-crimson" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium">Phone</span>
                      <input value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} className="w-full p-3.5 border border-silver text-[13px] outline-none focus:border-crimson" />
                    </label>
                    <label className="space-y-2 sm:col-span-2">
                      <span className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium">Email</span>
                      <input value={user.email || ''} disabled className="w-full p-3.5 border border-silver bg-offwhite text-mid-gray text-[13px]" />
                    </label>
                  </div>
                  <button onClick={() => saveProfile()} className="px-6 py-3 bg-crimson text-white text-[10px] tracking-[2px] uppercase">Save Details</button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function PanelTitle({ title }: { title: string }) {
  return <h2 className="text-[11px] tracking-[3px] uppercase text-dark mb-8 font-semibold border-b border-silver pb-4">{title}</h2>;
}

function SuperUserList({ profiles, allCount, search, setSearch, selectedProfile, onSelect }: { profiles: AccountProfile[]; allCount: number; search: string; setSearch: (value: string) => void; selectedProfile: AccountProfile | null; onSelect: (id: string) => void }) {
  return (
    <aside className="bg-white border border-silver p-5">
      <div className="mb-5">
        <h2 className="text-[11px] tracking-[3px] uppercase text-dark mb-3 font-semibold">All Users</h2>
        <label className="block">
          <span className="sr-only">Search users</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, phone, role"
            className="w-full border border-silver bg-white px-3 py-2 text-[12px] outline-none focus:border-crimson"
          />
        </label>
        <p className="mt-2 text-[10px] uppercase tracking-[1.5px] text-mid-gray">{profiles.length} of {allCount} users</p>
      </div>
      <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
        {profiles.length === 0 ? (
          <p className="text-[12px] text-mid-gray">No matching users. Try another name or email.</p>
        ) : profiles.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full text-left border px-3 py-2 min-h-[52px] transition-colors ${selectedProfile?.id === item.id ? 'border-crimson bg-offwhite' : 'border-silver hover:border-crimson'}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[12px] text-dark">{item.full_name || item.email}</div>
                <div className="truncate text-[10px] text-mid-gray mt-0.5">{item.email}</div>
              </div>
              <div className="shrink-0 text-[8px] uppercase tracking-[1.2px] text-crimson">{item.role}</div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

function AdminOrdersTable({ orders, profiles, customer, onSave }: { orders: CustomerOrder[]; profiles: AccountProfile[]; customer: string; onSave: (order: CustomerOrder) => Promise<void> }) {
  return (
    <AdminTableShell title={`${customer} Orders`} empty={orders.length === 0}>
      {orders.map((order) => (
        <div key={order.id}>
          <AdminOrderRow order={order} customer={profileLabel(profiles, order.user_id)} onSave={onSave} />
        </div>
      ))}
    </AdminTableShell>
  );
}

function AdminOrderRow({ order, customer, onSave }: { order: CustomerOrder; customer: string; onSave: (order: CustomerOrder) => Promise<void> }) {
  const [draft, setDraft] = useState(order);
  const update = (key: keyof CustomerOrder, value: string | number) => setDraft((current) => ({ ...current, [key]: value }));

  useEffect(() => setDraft(order), [order.id, order.updated_at]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr_0.8fr_1fr_1fr_auto] gap-3 border-b border-silver py-4 items-end">
      <div>
        <div className="text-[10px] tracking-[2px] uppercase text-mid-gray">Order</div>
        <div className="text-[13px] text-dark">{draft.order_number}</div>
        <div className="text-[11px] text-mid-gray">{customer}</div>
      </div>
      <label className="space-y-1">
        <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">Status</span>
        <select value={draft.status} onChange={(event) => update('status', event.target.value)} className="w-full border border-silver bg-white p-2 text-[12px]">
          {ORDER_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">Carrier</span>
        <input value={draft.carrier || ''} onChange={(event) => update('carrier', event.target.value)} className="w-full border border-silver p-2 text-[12px]" />
      </label>
      <label className="space-y-1">
        <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">Tracking No.</span>
        <input value={draft.tracking_number || ''} onChange={(event) => update('tracking_number', event.target.value)} className="w-full border border-silver p-2 text-[12px]" />
      </label>
      <label className="space-y-1">
        <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">Tracking URL</span>
        <input value={draft.tracking_url || ''} onChange={(event) => update('tracking_url', event.target.value)} className="w-full border border-silver p-2 text-[12px]" />
      </label>
      <button onClick={() => onSave(draft)} className="bg-crimson text-white px-4 py-2 text-[10px] tracking-[2px] uppercase">Save</button>
      <div className="xl:col-span-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <MoneyMinorInput label="Subtotal" value={draft.subtotal_minor} onChange={(value) => update('subtotal_minor', value)} />
        <MoneyMinorInput label="Delivery" value={draft.delivery_minor} onChange={(value) => update('delivery_minor', value)} />
        <MoneyMinorInput label="Total" value={draft.total_minor} onChange={(value) => update('total_minor', value)} />
        <label className="space-y-1">
          <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">Currency</span>
          <input value={draft.currency} onChange={(event) => update('currency', event.target.value)} className="w-full border border-silver p-2 text-[12px]" />
        </label>
      </div>
    </div>
  );
}

function AdminReturnsTable({ returns, orders, profiles, customer, onSave }: { returns: ReturnRequest[]; orders: CustomerOrder[]; profiles: AccountProfile[]; customer: string; onSave: (item: ReturnRequest) => Promise<void> }) {
  return (
    <AdminTableShell title={`${customer} Returns`} empty={returns.length === 0}>
      {returns.map((item) => (
        <div key={item.id}>
          <AdminReturnRow item={item} order={orders.find((order) => order.id === item.order_id)} customer={profileLabel(profiles, item.user_id)} onSave={onSave} />
        </div>
      ))}
    </AdminTableShell>
  );
}

function AdminReturnRow({ item, order, customer, onSave }: { item: ReturnRequest; order?: CustomerOrder; customer: string; onSave: (item: ReturnRequest) => Promise<void> }) {
  const [draft, setDraft] = useState(item);
  const update = (key: keyof ReturnRequest, value: string) => setDraft((current) => ({ ...current, [key]: value }));

  useEffect(() => setDraft(item), [item.id, item.updated_at]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_auto] gap-3 border-b border-silver py-4 items-end">
      <div>
        <div className="text-[10px] tracking-[2px] uppercase text-mid-gray">Customer</div>
        <div className="text-[13px] text-dark">{customer}</div>
        <div className="text-[11px] text-mid-gray">{order?.order_number || 'No order linked'}</div>
      </div>
      <label className="space-y-1">
        <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">Reason</span>
        <input value={draft.reason} onChange={(event) => update('reason', event.target.value)} className="w-full border border-silver p-2 text-[12px]" />
      </label>
      <label className="space-y-1">
        <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">Status</span>
        <select value={draft.status} onChange={(event) => update('status', event.target.value)} className="w-full border border-silver bg-white p-2 text-[12px]">
          {RETURN_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </label>
      <button onClick={() => onSave(draft)} className="bg-crimson text-white px-4 py-2 text-[10px] tracking-[2px] uppercase">Save</button>
      <label className="lg:col-span-4 space-y-1">
        <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">Message</span>
        <textarea value={draft.message || ''} onChange={(event) => update('message', event.target.value)} className="w-full border border-silver p-2 text-[12px] min-h-20" />
      </label>
    </div>
  );
}

function AdminWishlistTable({ wishlist, profiles, products, customer, onSave, onDelete }: { wishlist: WishlistItemRow[]; profiles: AccountProfile[]; products: Product[]; customer: string; onSave: (item: WishlistItemRow, nextProductSlug: string) => Promise<void>; onDelete: (item: WishlistItemRow) => Promise<void> }) {
  return (
    <AdminTableShell title={`${customer} Wishlist Items`} empty={wishlist.length === 0}>
      {wishlist.map((item) => (
        <div key={`${item.user_id}-${item.product_slug}`}>
          <AdminWishlistRow item={item} customer={profileLabel(profiles, item.user_id)} products={products} onSave={onSave} onDelete={onDelete} />
        </div>
      ))}
    </AdminTableShell>
  );
}

function AdminWishlistRow({ item, customer, products, onSave, onDelete }: { item: WishlistItemRow; customer: string; products: Product[]; onSave: (item: WishlistItemRow, nextProductSlug: string) => Promise<void>; onDelete: (item: WishlistItemRow) => Promise<void> }) {
  const [productSlug, setProductSlug] = useState(item.product_slug);
  useEffect(() => setProductSlug(item.product_slug), [item.product_slug]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3 border-b border-silver py-4 items-end">
      <div>
        <div className="text-[10px] tracking-[2px] uppercase text-mid-gray">Customer</div>
        <div className="text-[13px] text-dark">{customer}</div>
        <div className="text-[11px] text-mid-gray">{formatDate(item.created_at)}</div>
      </div>
      <label className="space-y-1">
        <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">Product</span>
        <select value={productSlug} onChange={(event) => setProductSlug(event.target.value)} className="w-full border border-silver bg-white p-2 text-[12px]">
          <option value={item.product_slug}>{item.product_slug}</option>
          {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
        </select>
      </label>
      <button onClick={() => onSave(item, productSlug)} className="bg-crimson text-white px-4 py-2 text-[10px] tracking-[2px] uppercase">Save</button>
      <button onClick={() => onDelete(item)} className="border border-silver px-4 py-2 text-[10px] tracking-[2px] uppercase text-charcoal">Remove</button>
    </div>
  );
}

function AdminCartTable({ cartItems, profiles, selectedProfile, products, onAdd, onSave, onDelete }: { cartItems: CustomerCartItemRow[]; profiles: AccountProfile[]; selectedProfile: AccountProfile | null; products: Product[]; onAdd: (userId: string, productSlug: string, quantity: number) => Promise<void>; onSave: (item: CustomerCartItemRow, nextProductSlug: string, quantity: number) => Promise<void>; onDelete: (item: CustomerCartItemRow) => Promise<void> }) {
  const [newProductSlug, setNewProductSlug] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const selectedUserId = selectedProfile?.id || '';
  const selectedCustomer = selectedProfile ? profileLabel(profiles, selectedProfile.id) : 'No customer selected';

  useEffect(() => {
    if (!newProductSlug && products[0]) setNewProductSlug(products[0].id);
  }, [products, newProductSlug]);

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice('');

    try {
      await onAdd(selectedUserId, newProductSlug, newQuantity);
      setNewQuantity(1);
      setNotice('Bag item saved and the customer record was refreshed.');
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white border border-silver p-5 sm:p-6">
      <h2 className="text-[11px] tracking-[3px] uppercase text-dark mb-5 font-semibold">{selectedCustomer} Bag Items</h2>

      <form onSubmit={handleAdd} className="mb-8 border border-silver bg-offwhite p-4 sm:p-5">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="serif text-2xl text-dark">Add Bag Item</h3>
            <p className="text-[12px] text-mid-gray">This updates the selected customer's Your Bag view.</p>
          </div>
          <button disabled={!selectedUserId || !newProductSlug || saving} className="bg-crimson text-white px-5 py-3 text-[10px] tracking-[2px] uppercase disabled:opacity-50">
            {saving ? 'Saving' : 'Save Bag Item'}
          </button>
        </div>

        {notice && <InlineNotice message={notice} />}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px] gap-3">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">Customer</span>
            <div className="w-full border border-silver bg-white p-2 text-[12px] min-h-[34px]">{selectedCustomer}</div>
          </div>
          <label className="space-y-1">
            <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">Product</span>
            <select value={newProductSlug} onChange={(event) => setNewProductSlug(event.target.value)} className="w-full border border-silver bg-white p-2 text-[12px]">
              <option value="">Select product</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">Quantity</span>
            <input type="number" min="1" value={newQuantity} onChange={(event) => setNewQuantity(Math.max(1, Number(event.target.value || 1)))} className="w-full border border-silver p-2 text-[12px]" />
          </label>
        </div>
      </form>

      {cartItems.length === 0 ? (
        <p className="text-[12px] text-mid-gray">No bag items yet.</p>
      ) : cartItems.map((item) => (
        <div key={`${item.user_id}-${item.product_slug}`}>
          <AdminCartRow item={item} customer={profileLabel(profiles, item.user_id)} products={products} onSave={onSave} onDelete={onDelete} />
        </div>
      ))}
    </section>
  );
}

function AdminCartRow({ item, customer, products, onSave, onDelete }: { item: CustomerCartItemRow; customer: string; products: Product[]; onSave: (item: CustomerCartItemRow, nextProductSlug: string, quantity: number) => Promise<void>; onDelete: (item: CustomerCartItemRow) => Promise<void> }) {
  const [productSlug, setProductSlug] = useState(item.product_slug);
  const [quantity, setQuantity] = useState(item.quantity);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const product = products.find((candidate) => candidate.id === item.product_slug) || item.item_snapshot;

  useEffect(() => {
    setProductSlug(item.product_slug);
    setQuantity(item.quantity);
  }, [item.product_slug, item.quantity]);

  const handleSave = async () => {
    setSaving(true);
    setNotice('');

    try {
      await onSave(item, productSlug, quantity);
      setNotice('Saved.');
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setNotice('');

    try {
      await onDelete(item);
      setNotice('Removed.');
    } catch (error) {
      setNotice(getErrorMessage(error));
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_100px_auto_auto] gap-3 border-b border-silver py-4 items-end">
      <div>
        <div className="text-[10px] tracking-[2px] uppercase text-mid-gray">Customer</div>
        <div className="text-[13px] text-dark">{customer}</div>
        <div className="text-[11px] text-mid-gray">{formatDate(item.updated_at)}</div>
      </div>
      <label className="space-y-1">
        <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">Product</span>
        <select value={productSlug} onChange={(event) => setProductSlug(event.target.value)} className="w-full border border-silver bg-white p-2 text-[12px]">
          <option value={item.product_slug}>{product?.name || item.product_slug}</option>
          {products.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">Qty</span>
        <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value || 1)))} className="w-full border border-silver p-2 text-[12px]" />
      </label>
      <button disabled={saving} onClick={handleSave} className="bg-crimson text-white px-4 py-2 text-[10px] tracking-[2px] uppercase disabled:opacity-50">{saving ? 'Saving' : 'Save'}</button>
      <button disabled={saving} onClick={handleDelete} className="border border-silver px-4 py-2 text-[10px] tracking-[2px] uppercase text-charcoal disabled:opacity-50">Remove</button>
      {notice && <div className="md:col-span-5"><InlineNotice message={notice} /></div>}
    </div>
  );
}

function AdminAddressesTable({ addresses, profiles, selectedProfile, onSave, onArchive }: { addresses: CustomerAddress[]; profiles: AccountProfile[]; selectedProfile: AccountProfile | null; onSave: (address: CustomerAddress) => Promise<void>; onArchive: (id?: string) => Promise<void> }) {
  const [newAddress, setNewAddress] = useState<CustomerAddress>(() => ({
    ...emptyAddress(selectedProfile?.id || ''),
    id: undefined,
  }));
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const selectedUserId = selectedProfile?.id || '';
  const selectedCustomer = selectedProfile ? profileLabel(profiles, selectedProfile.id) : 'No customer selected';

  useEffect(() => {
    if (!selectedUserId) return;
    setNewAddress((current) => ({ ...current, user_id: selectedUserId }));
  }, [selectedUserId]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice('');

    try {
      const validationMessage = validateAddress(newAddress);
      if (validationMessage) throw new Error(validationMessage);

      await onSave(newAddress);
      setNewAddress({
        ...emptyAddress(selectedUserId),
        id: undefined,
      });
      setNotice('Address saved and the customer record was refreshed.');
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white border border-silver p-5 sm:p-6">
      <h2 className="text-[11px] tracking-[3px] uppercase text-dark mb-5 font-semibold">{selectedCustomer} Addresses</h2>

      <form onSubmit={handleCreate} className="mb-8 border border-silver bg-offwhite p-4 sm:p-5">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="serif text-2xl text-dark">Add Address</h3>
            <p className="text-[12px] text-mid-gray">Choose the user, enter the address, then save it to their account.</p>
          </div>
          <button disabled={!selectedUserId || saving} className="bg-crimson text-white px-5 py-3 text-[10px] tracking-[2px] uppercase disabled:opacity-50">
            {saving ? 'Saving' : 'Save Address'}
          </button>
        </div>

        {notice && <InlineNotice message={notice} />}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1 md:col-span-2">
            <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">User</span>
            <div className="w-full border border-silver bg-white p-2 text-[12px] min-h-[34px]">{selectedCustomer}</div>
          </div>
          <AddressInputField label="Label" value={newAddress.label} onChange={(value) => setNewAddress((current) => ({ ...current, label: value }))} />
          <AddressInputField required label="Full Name" value={newAddress.full_name} onChange={(value) => setNewAddress((current) => ({ ...current, full_name: value }))} />
          <AddressInputField required label="Phone" value={newAddress.phone || ''} onChange={(value) => setNewAddress((current) => ({ ...current, phone: value }))} />
          <AddressInputField required label="Line 1" value={newAddress.line1} onChange={(value) => setNewAddress((current) => ({ ...current, line1: value }))} />
          <AddressInputField label="Line 2" value={newAddress.line2 || ''} onChange={(value) => setNewAddress((current) => ({ ...current, line2: value }))} />
          <AddressInputField required label="City / Suburb" value={newAddress.city} onChange={(value) => setNewAddress((current) => ({ ...current, city: value }))} />
          <AddressInputField required label="Province" value={newAddress.province || ''} onChange={(value) => setNewAddress((current) => ({ ...current, province: value }))} />
          <AddressInputField required label="Postcode" value={newAddress.postal_code || ''} onChange={(value) => setNewAddress((current) => ({ ...current, postal_code: value }))} />
          <AddressInputField required label="Country" value={newAddress.country} onChange={(value) => setNewAddress((current) => ({ ...current, country: value }))} />
          <label className="flex items-center gap-2 text-[12px] text-charcoal md:self-end md:pb-2">
            <input
              type="checkbox"
              checked={newAddress.is_default}
              onChange={(event) => setNewAddress((current) => ({ ...current, is_default: event.target.checked }))}
            />
            Default
          </label>
        </div>
      </form>

      {addresses.length === 0 ? (
        <p className="text-[12px] text-mid-gray">No saved addresses yet.</p>
      ) : addresses.map((address) => (
        <div key={address.id}>
          <AdminAddressRow address={address} customer={profileLabel(profiles, address.user_id)} onSave={onSave} onArchive={onArchive} />
        </div>
      ))}
    </section>
  );
}

function AddressInputField({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="space-y-1">
      <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">{label}{required ? ' *' : ''}</span>
      <input required={required} value={value} onChange={(event) => onChange(event.target.value)} className="w-full border border-silver p-2 text-[12px]" />
    </label>
  );
}

function AdminAddressRow({ address, customer, onSave, onArchive }: { address: CustomerAddress; customer: string; onSave: (address: CustomerAddress) => Promise<void>; onArchive: (id?: string) => Promise<void> }) {
  const [draft, setDraft] = useState(address);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (key: keyof CustomerAddress, value: string | boolean) => setDraft((current) => ({ ...current, [key]: value }));

  useEffect(() => setDraft(address), [address.id, address.updated_at]);

  const handleSave = async () => {
    setSaving(true);
    setNotice('');

    try {
      const validationMessage = validateAddress(draft);
      if (validationMessage) throw new Error(validationMessage);

      await onSave(draft);
      setNotice('Saved.');
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    setSaving(true);
    setNotice('');

    try {
      await onArchive(draft.id);
      setNotice('Archived.');
    } catch (error) {
      setNotice(getErrorMessage(error));
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_auto_auto] gap-3 border-b border-silver py-4 items-end">
      <div>
        <div className="text-[10px] tracking-[2px] uppercase text-mid-gray">Customer</div>
        <div className="text-[13px] text-dark">{customer}</div>
        <label className="mt-2 flex items-center gap-2 text-[12px] text-charcoal">
          <input type="checkbox" checked={draft.is_default} onChange={(event) => update('is_default', event.target.checked)} />
          Default
        </label>
      </div>
      <label className="space-y-1">
        <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">Name</span>
        <input value={draft.full_name} onChange={(event) => update('full_name', event.target.value)} className="w-full border border-silver p-2 text-[12px]" />
      </label>
      <label className="space-y-1">
        <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">Phone</span>
        <input value={draft.phone || ''} onChange={(event) => update('phone', event.target.value)} className="w-full border border-silver p-2 text-[12px]" />
      </label>
      <button disabled={saving} onClick={handleSave} className="bg-crimson text-white px-4 py-2 text-[10px] tracking-[2px] uppercase disabled:opacity-50">{saving ? 'Saving' : 'Save'}</button>
      <button disabled={saving} onClick={handleArchive} className="border border-silver px-4 py-2 text-[10px] tracking-[2px] uppercase text-charcoal disabled:opacity-50">Archive</button>
      <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-5 gap-3">
        {[
          ['label', 'Label'],
          ['line1', 'Line 1 *'],
          ['line2', 'Line 2'],
          ['city', 'City / Suburb *'],
          ['province', 'Province *'],
          ['postal_code', 'Postcode *'],
          ['country', 'Country *'],
        ].map(([key, label]) => (
          <label key={key} className="space-y-1">
            <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">{label}</span>
            <input value={String(draft[key as keyof CustomerAddress] || '')} onChange={(event) => update(key as keyof CustomerAddress, event.target.value)} className="w-full border border-silver p-2 text-[12px]" />
          </label>
        ))}
      </div>
      {notice && <div className="lg:col-span-5"><InlineNotice message={notice} /></div>}
    </div>
  );
}

function InlineNotice({ message }: { message: string }) {
  const isError = /required|choose|could not|failed|error|must/i.test(message);

  return (
    <div className={`mb-4 border px-4 py-3 text-[12px] ${isError ? 'border-crimson/30 bg-red-50 text-crimson' : 'border-silver bg-white text-charcoal'}`}>
      {message}
    </div>
  );
}

function AdminTableShell({ title, empty, children }: { title: string; empty: boolean; children: ReactNode }) {
  return (
    <section className="bg-white border border-silver p-5 sm:p-6">
      <h2 className="text-[11px] tracking-[3px] uppercase text-dark mb-5 font-semibold">{title}</h2>
      {empty ? <p className="text-[12px] text-mid-gray">No records yet.</p> : children}
    </section>
  );
}

function MoneyMinorInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="space-y-1">
      <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">{label}</span>
      <input
        type="number"
        step="0.01"
        value={(value || 0) / 100}
        onChange={(event) => onChange(Math.round(Number(event.target.value || 0) * 100))}
        className="w-full border border-silver p-2 text-[12px]"
      />
    </label>
  );
}

function EmptyState({ icon: Icon, text, action }: { icon: LucideIcon; text: string; action?: ReactNode }) {
  return (
    <div className="text-center py-20 text-charcoal bg-white border border-silver">
      <Icon size={40} className="mx-auto mb-4 text-mid-gray" />
      <p className="text-[13px] font-light mb-6">{text}</p>
      {action}
    </div>
  );
}

function SummaryPanel({ title, empty, children }: { title: string; empty: string; children: ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <section className="bg-white border border-silver p-5">
      <h3 className="text-[10px] tracking-[2px] uppercase text-dark mb-4 font-semibold">{title}</h3>
      <div className="space-y-3">
        {hasChildren ? children : <p className="text-[12px] text-mid-gray">{empty}</p>}
      </div>
    </section>
  );
}

function SmallRow({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="border border-silver bg-white px-4 py-3">
      <div className="text-[13px] text-dark">{title}</div>
      <div className="text-[10px] tracking-[1px] uppercase text-mid-gray mt-1">{meta}</div>
    </div>
  );
}

function OrderCard({ order, showTracking = false }: { order: CustomerOrder; showTracking?: boolean }) {
  return (
    <div className="bg-white border border-silver p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-5 pb-4 border-b border-silver">
        <div>
          <span className="text-[11px] tracking-[2px] uppercase font-semibold text-dark">{order.order_number}</span>
          <span className="ml-0 sm:ml-4 block sm:inline text-[11px] text-mid-gray">{formatDate(order.placed_at || order.created_at)}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] tracking-[1px] uppercase font-semibold text-crimson">{statusLabel(order.status)}</span>
          <span className="text-[13px] font-medium text-dark">{orderTotal(order)}</span>
        </div>
      </div>
      <div className="space-y-4">
        {(order.items || []).map((item, index) => (
          <div key={`${item.name}-${index}`} className="flex gap-4">
            <SafeImage src={item.image || PLACEHOLDER_IMAGES.product} alt={item.name || 'Order item'} className="w-14 h-16 object-cover shrink-0 bg-offwhite" />
            <div>
              <div className="serif text-[14px] text-dark">{item.name || 'Order item'}</div>
              <div className="text-[11px] text-mid-gray mt-1">Qty: {item.qty || item.quantity || 1}</div>
            </div>
          </div>
        ))}
      </div>
      {(showTracking || order.tracking_number || order.carrier) && (
        <div className="mt-5 pt-4 border-t border-silver text-[12px] text-charcoal">
          <div>Carrier: {order.carrier || 'Not assigned yet'}</div>
          <div>Tracking: {order.tracking_number || 'Not available yet'}</div>
          {order.tracking_url && <a href={order.tracking_url} target="_blank" rel="noreferrer" className="text-crimson text-[10px] tracking-[2px] uppercase mt-2 inline-block">Open Tracking</a>}
        </div>
      )}
    </div>
  );
}

function AddressCard({ address, onEdit, onRemove }: { address: CustomerAddress; onEdit?: () => void; onRemove?: () => void }) {
  return (
    <div className="bg-white border border-silver p-5 relative">
      {address.is_default && <span className="absolute top-3 right-3 text-[9px] tracking-[1.5px] uppercase text-crimson font-semibold">Default</span>}
      <MapPin size={16} className="text-crimson mb-3" />
      <p className="text-[13px] text-dark font-medium mb-1">{address.full_name}</p>
      <p className="text-[12px] text-charcoal leading-relaxed">
        {address.line1}<br />
        {address.line2 && <>{address.line2}<br /></>}
        {address.city}, {address.province} {address.postal_code}<br />
        {address.country}
      </p>
      {(onEdit || onRemove) && (
        <div className="flex gap-4 mt-4 pt-4 border-t border-silver">
          {onEdit && <button onClick={onEdit} className="text-[10px] tracking-[1px] uppercase text-charcoal hover:text-crimson">Edit</button>}
          {onRemove && <button onClick={onRemove} className="text-[10px] tracking-[1px] uppercase text-charcoal hover:text-crimson">Remove</button>}
        </div>
      )}
    </div>
  );
}

function AddressForm({ draft, setDraft, onSubmit, onCancel }: { draft: AddressInput; setDraft: (value: AddressInput) => void; onSubmit: (event: FormEvent) => void; onCancel: () => void }) {
  const update = (key: keyof AddressInput, value: string | boolean) => setDraft({ ...draft, [key]: value });

  return (
    <form onSubmit={onSubmit} className="bg-white border border-silver p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="serif text-2xl text-dark">{draft.id ? 'Edit Address' : 'New Address'}</h3>
          <p className="text-[12px] text-mid-gray mt-1">Saved addresses can be selected during checkout.</p>
        </div>
        <button type="button" onClick={onCancel} className="text-[18px] leading-none text-mid-gray hover:text-crimson" aria-label="Close address form">x</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AddressInputField label="Label" value={draft.label} onChange={(value) => update('label', value)} />
        <AddressInputField required label="Full Name" value={draft.full_name} onChange={(value) => update('full_name', value)} />
        <AddressInputField required label="Phone" value={draft.phone || ''} onChange={(value) => update('phone', value)} />
        <AddressInputField required label="Address Line 1" value={draft.line1} onChange={(value) => update('line1', value)} />
        <AddressInputField label="Address Line 2" value={draft.line2 || ''} onChange={(value) => update('line2', value)} />
        <AddressInputField required label="City / Suburb" value={draft.city} onChange={(value) => update('city', value)} />
        <AddressInputField required label="Province" value={draft.province || ''} onChange={(value) => update('province', value)} />
        <AddressInputField required label="Postal Code" value={draft.postal_code || ''} onChange={(value) => update('postal_code', value)} />
        <AddressInputField required label="Country" value={draft.country} onChange={(value) => update('country', value)} />
        <label className="flex items-center gap-2 text-[12px] text-charcoal sm:self-end sm:pb-2">
          <input type="checkbox" checked={draft.is_default} onChange={(event) => update('is_default', event.target.checked)} />
          Default delivery address
        </label>
      </div>

      <div className="flex gap-3 mt-5">
        <button className="flex-1 bg-crimson text-white py-3 text-[10px] tracking-[2px] uppercase">Save Address</button>
        <button type="button" onClick={onCancel} className="px-5 border border-silver text-[10px] tracking-[2px] uppercase text-charcoal hover:border-crimson hover:text-crimson">Cancel</button>
      </div>
    </form>
  );
}

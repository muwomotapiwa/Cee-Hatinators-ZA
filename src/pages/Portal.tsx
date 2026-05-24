import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SupabaseCatalogService } from '../services/SupabaseCatalogService';

const portalSections = [
  { title: 'Content', description: 'Hero, newsletter, footer, story, and contact copy.', path: '/portal/content' },
  { title: 'Spotlight Collection', description: 'Home spotlight images, copy, bullets, and shop link.', path: '/portal/spotlight-collection' },
  { title: 'Products', description: 'Product names, prices for display, images, badges, and status.', path: '/portal/products' },
  { title: 'Categories', description: 'Category tiles, shop filters, images, and ordering.', path: '/portal/categories' },
  { title: 'Occasions', description: 'Shop occasion filters and hat assignments.', path: '/portal/occasions' },
  { title: 'Collections', description: 'Curated edits and featured collection sections.', path: '/portal/collections' },
  { title: 'Testimonials', description: 'Customer stories, ratings, names, and ordering.', path: '/portal/testimonials' },
  { title: 'Messages', description: 'Contact form submissions and handling status.', path: '/portal/messages' },
  { title: 'Newsletter', description: 'Subscriber list and export workflow.', path: '/portal/newsletter' },
  { title: 'Settings', description: 'Announcement, contact details, social links, and shipping copy.', path: '/portal/settings' },
];

export function PortalPage() {
  const [email, setEmail] = useState('ndinimuridzi@ceehatinators.co.za');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const { user, profile, loading, isSuperUser, signInWithPassword, signOut, refreshProfile } = useAuth();

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await signInWithPassword(email, password);
      await refreshProfile();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sign in failed.');
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setPassword('');
    setMessage('');
  };

  const handleSeedCurrentSite = async () => {
    setSyncing(true);
    setMessage('');

    try {
      await SupabaseCatalogService.seedCurrentSiteData();
      setMessage('Current site data synced into Supabase. Open each portal area to edit it.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center text-[11px] tracking-[2px] uppercase text-mid-gray">
        Loading portal...
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center px-6">
        <div className="max-w-md bg-white border border-silver p-8">
          <h1 className="serif text-3xl text-dark mb-3">Portal Not Configured</h1>
          <p className="text-sm text-charcoal leading-7">
            Add the Supabase URL and publishable key to `.env.local` before using the portal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite px-6 py-12 sm:px-10">
      <div className="max-w-[1180px] mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] tracking-[1.5px] uppercase text-mid-gray hover:text-crimson transition-colors mb-10"
        >
          <ArrowLeft size={13} /> Back to Store
        </Link>

        <div className="grid lg:grid-cols-[360px_1fr] gap-10 lg:items-start">
          <section className="bg-white border border-silver p-7 h-fit lg:mt-[124px]">
            <span className="text-[10px] tracking-[3px] uppercase text-crimson block mb-3">Super User Portal</span>
            <h1 className="serif text-[clamp(32px,5vw,46px)] font-light text-dark leading-tight mb-4">
              Cee Hatinators Admin
            </h1>
            <p className="text-[12px] leading-7 text-charcoal mb-6">
              Sign in with the Supabase user assigned to `profiles.role = super_user`.
            </p>

            {user ? (
              <div className="space-y-5">
                <div className="border border-silver bg-offwhite p-4">
                  <div className="flex items-center gap-2 text-crimson mb-2">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] tracking-[2px] uppercase">{profile?.role || 'general_user'}</span>
                  </div>
                  <p className="serif text-2xl text-dark">{user.displayName || user.email}</p>
                  <p className="text-[11px] text-mid-gray mt-1">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full border border-silver py-3 text-[10px] tracking-[2px] uppercase text-dark hover:border-crimson hover:text-crimson transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium flex items-center gap-1.5 mb-1">
                    <Mail size={11} /> Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    className="w-full p-3.5 border border-silver bg-white font-sans text-[13px] outline-none focus:border-crimson"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium flex items-center gap-1.5 mb-1">
                    <Lock size={11} /> Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    className="w-full p-3.5 border border-silver bg-white font-sans text-[13px] outline-none focus:border-crimson"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-crimson text-white py-4 text-[11px] tracking-[2px] uppercase hover:bg-crimson-dark transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            )}

            {message && (
              <div className="mt-5 p-3 bg-red-50 border border-red-200 text-[11px] leading-6 text-red-700">
                {message}
              </div>
            )}
          </section>

          <section>
            {isSuperUser ? (
              <>
                <div className="mb-8">
                  <span className="text-[10px] tracking-[3px] uppercase text-crimson block mb-3">Access Granted</span>
                  <h2 className="serif text-[clamp(32px,5vw,52px)] font-light text-dark leading-tight">
                    Editable Site Areas
                  </h2>
                  <p className="text-[12px] leading-7 text-charcoal mt-3 max-w-2xl">
                    This confirms the Supabase auth and role check are working. The edit screens below are the next build step.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {portalSections.map((section) => (
                    <Link key={section.title} to={section.path || '/portal'} className="bg-white border border-silver p-5 block hover:border-crimson transition-colors">
                      <h3 className="serif text-2xl text-dark mb-2">{section.title}</h3>
                      <p className="text-[12px] leading-6 text-charcoal">{section.description}</p>
                    </Link>
                  ))}
                </div>
                <div className="mt-6 bg-white border border-silver p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-[12px] leading-6 text-charcoal">
                    If an area says no records, sync the current storefront content into Supabase first.
                  </p>
                  <button
                    type="button"
                    onClick={handleSeedCurrentSite}
                    disabled={syncing}
                    className="bg-crimson text-white px-5 py-3 text-[10px] tracking-[2px] uppercase hover:bg-crimson-dark transition-colors disabled:opacity-60"
                  >
                    {syncing ? 'Syncing...' : 'Sync Current Site Data'}
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white border border-silver p-8">
                <span className="text-[10px] tracking-[3px] uppercase text-crimson block mb-3">Access Pending</span>
                <h2 className="serif text-4xl text-dark font-light mb-4">Create the Super User First</h2>
                <p className="text-[13px] leading-7 text-charcoal mb-4">
                  You are signed in, but this area is only visible to accounts with `profiles.role = super_user`.
                </p>
                <ol className="list-decimal pl-5 text-[13px] leading-7 text-charcoal">
                  <li>Confirm this user exists in Supabase Authentication.</li>
                  <li>Run the profile role SQL from `docs/supabase-create-super-user-profile.sql` if this should be a super user.</li>
                  <li>Sign out and sign back in after changing the role.</li>
                </ol>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
